import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    const format = fields.format[0] as string;
    
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