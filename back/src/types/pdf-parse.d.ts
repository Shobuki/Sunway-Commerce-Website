declare module 'pdf-parse' {
    interface PDFData {
      numpages: number;
      numrender: number;
      info: any;
      metadata: any;
      text: string;
    }
    function pdfParse(dataBuffer: Buffer): Promise<PDFData>;
    export default pdfParse;
  }
  