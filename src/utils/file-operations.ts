import { mkdir, unlink } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { ConversionError, ErrorCodes } from '@/types/errors';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'gif'] as const;
export type SupportedFormat = typeof SUPPORTED_FORMATS[number];

export interface FileOperationOptions {
  maxSize?: number;
  allowedFormats?: readonly string[];
}

export class FileOperations {
  private tempDir: string;

  constructor(private options: FileOperationOptions = {}) {
    this.tempDir = path.join(process.cwd(), 'tmp');
    this.options.maxSize = options.maxSize || MAX_FILE_SIZE;
    this.options.allowedFormats = options.allowedFormats || SUPPORTED_FORMATS;
  }

  async ensureTempDir(): Promise<void> {
    try {
      await mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      throw new ConversionError(
        'Failed to create temporary directory',
        ErrorCodes.STORAGE_ERROR
      );
    }
  }

  async saveFile(file: { filepath: string; size: number; newFilename: string }): Promise<string> {
    if (file.size > this.options.maxSize!) {
      throw new ConversionError(
        `File size exceeds ${this.options.maxSize! / 1024 / 1024}MB limit`,
        ErrorCodes.FILE_TOO_LARGE
      );
    }

    await this.ensureTempDir();
    const tempPath = path.join(this.tempDir, file.newFilename);

    try {
      await new Promise<void>((resolve, reject) => {
        const writeStream = createWriteStream(tempPath);
        const readStream = createReadStream(file.filepath);

        const cleanup = () => {
          writeStream.end();
          readStream.destroy();
        };

        writeStream.on('error', (error) => {
          cleanup();
          reject(error);
        });

        readStream.on('error', (error) => {
          cleanup();
          reject(error);
        });

        writeStream.on('finish', () => {
          cleanup();
          resolve();
        });

        readStream.pipe(writeStream);
      });

      return tempPath;
    } catch (error) {
      await this.cleanup(tempPath).catch(() => {});
      throw new ConversionError(
        'Failed to save file',
        ErrorCodes.STORAGE_ERROR
      );
    }
  }

  async cleanup(...paths: string[]): Promise<void> {
    await Promise.allSettled(
      paths.filter(Boolean).map(path => 
        unlink(path).catch(() => {})
      )
    );
  }

  validateFormat(format: string): asserts format is SupportedFormat {
    if (!this.options.allowedFormats!.includes(format.toLowerCase())) {
      throw new ConversionError(
        `Unsupported format: ${format}. Supported formats: ${this.options.allowedFormats!.join(', ')}`,
        ErrorCodes.INVALID_FORMAT
      );
    }
  }
}
