declare module 'pdf-poppler' {
    interface Options {
      format?: 'jpeg' | 'png' | 'tiff';
      out_dir?: string;
      out_prefix?: string;
      page?: number | null; // Convert all pages if null
    }
  
    export function convert(filePath: string, opts: Options): Promise<void>;
  }
  