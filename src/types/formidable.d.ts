declare module 'formidable' {
  import { IncomingMessage } from 'http';

  interface Fields {
    [key: string]: string[] | undefined;
  }

  interface File {
    filepath: string;
    originalFilename: string | null;
    newFilename: string;
    mimetype: string | null;
    size: number;
  }

  interface Files {
    [key: string]: File[] | undefined;
  }

  interface Options {
    maxFileSize?: number;
    maxFieldsSize?: number;
    maxFields?: number;
    keepExtensions?: boolean;
    uploadDir?: string;
    multiples?: boolean;
  }

  class IncomingForm {
    parse(
      req: IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void
    ): void;
  }

  function formidable(options?: Options): IncomingForm;
  
  export { Fields, Files, File, Options, IncomingForm };
  export default formidable;
}