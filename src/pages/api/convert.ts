import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files } from 'formidable';
import sharp from 'sharp';
import { File } from 'formidable';
import { ConversionError, ErrorCodes } from '@/types/errors';
import { FileOperations, MAX_FILE_SIZE } from '@/utils/file-operations';

export const config = {
  api: {
    bodyParser: false,
  },
};

const fileOps = new FileOperations();

async function convertImage(inputPath: string, format: string): Promise<Buffer> {
  const validateFormat: typeof fileOps.validateFormat = format => fileOps.validateFormat(format);
  try {
    validateFormat(format);
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    const pipeline = image.rotate(); // Auto-rotate based on EXIF

    if (metadata.width && metadata.width > 4000) {
      pipeline.resize(4000, null, { withoutEnlargement: true });
    }

    switch (format.toLowerCase()) {
      case 'png':
        return pipeline.png({ palette: true }).toBuffer();
      case 'jpg':
      case 'jpeg':
        return pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
      case 'webp':
        return pipeline.webp({ quality: 85, effort: 6 }).toBuffer();
      case 'gif':
        return pipeline.gif({ colours: 256 }).toBuffer();
      default:
        throw new ConversionError('Invalid format', ErrorCodes.INVALID_FORMAT);
    }
  } catch (error) {
    if (error instanceof ConversionError) throw error;
    throw new ConversionError(
      'Failed to convert image',
      ErrorCodes.CONVERSION_FAILED
    );
  }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  let tempPath: string | undefined;
  let originalPath: string | undefined;

  try {
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      multiples: true,
    });

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const format = Array.isArray(fields.format) ? fields.format[0] : fields.format;

    if (!file || !format) {
      return res.status(400).json({ 
        error: 'Missing file or format',
        code: 'MISSING_PARAMETERS'
      });
    }

    originalPath = file.filepath;
    tempPath = await fileOps.saveFile(file);
    const convertedBuffer = await convertImage(tempPath, format);

    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Content-Disposition', `attachment; filename="converted.${format}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(convertedBuffer);
  } catch (error) {
    console.error('Conversion error:', error);
    
    if (error instanceof ConversionError) {
      res.status(400).json({ 
        error: error.message,
        code: error.code
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  } finally {
    if (tempPath || originalPath) {
      await fileOps.cleanup(tempPath!, originalPath!);
    }
  }
}
