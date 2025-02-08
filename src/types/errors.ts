export class ConversionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ConversionError';
  }
}

export const ErrorCodes = {
  INVALID_FORMAT: 'INVALID_FORMAT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  CONVERSION_FAILED: 'CONVERSION_FAILED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
