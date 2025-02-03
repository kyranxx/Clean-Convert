import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface FormidableError extends Error {
  httpCode?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable();
    const [fields, files]: [Fields, Files] = await new Promise((resolve, reject) => {
      form.parse(req, (err: FormidableError | null, fields: Fields, files: Files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file?.[0] as File;
    const format = fields.format?.[0] as string;
    
    if (!file || !format) {
      return res.status(400).json({ error: 'Missing file or format' });
    }

    const inputBuffer = await fs.readFile(file.filepath);
    let outputBuffer;

    switch (format.toLowerCase()) {
      case 'png':
        outputBuffer = await sharp(inputBuffer).png().toBuffer();
        break;
      case 'jpg':
      case 'jpeg':
        outputBuffer = await sharp(inputBuffer).jpeg().toBuffer();
        break;
      case 'webp':
        outputBuffer = await sharp(inputBuffer).webp().toBuffer();
        break;
      case 'gif':
        outputBuffer = await sharp(inputBuffer).gif().toBuffer();
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    // Clean up temp file
    await fs.unlink(file.filepath);

    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Content-Disposition', `attachment; filename="converted.${format}"`);
    res.send(outputBuffer);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
}