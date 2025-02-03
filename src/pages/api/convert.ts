import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files } from 'formidable';
import { createReadStream, createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import sharp from 'sharp';
import path from 'path';
import { File } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const saveFile = async (file: File): Promise<string> => {
  const tempPath = path.join(process.cwd(), 'tmp', file.newFilename);
  const writeStream = createWriteStream(tempPath);
  const readStream = createReadStream(file.filepath);
  
  await new Promise((resolve, reject) => {
    readStream.pipe(writeStream)
      .on('finish', () => resolve(undefined))
      .on('error', reject);
  });

  return tempPath;
};

const convertImage = async (inputPath: string, format: string): Promise<Buffer> => {
  const image = sharp(inputPath);
  
  switch (format.toLowerCase()) {
    case 'png':
      return image.png().toBuffer();
    case 'jpg':
    case 'jpeg':
      return image.jpeg().toBuffer();
    case 'webp':
      return image.webp().toBuffer();
    case 'gif':
      return image.gif().toBuffer();
    default:
      throw new Error('Unsupported format');
  }
};

const cleanupFiles = async (...paths: string[]) => {
  await Promise.all(paths.map(path => unlink(path).catch(() => {})));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const format = Array.isArray(fields.format) ? fields.format[0] : fields.format;

    if (!file || !format) {
      return res.status(400).json({ error: 'Missing file or format' });
    }

    const tempPath = await saveFile(file);
    const convertedBuffer = await convertImage(tempPath, format);

    await cleanupFiles(tempPath, file.filepath);

    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Content-Disposition', `attachment; filename="converted.${format}"`);
    res.send(convertedBuffer);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Failed to convert image' });
  }
}