import {
  PdfDocumentObject,
  PdfEngine,
  PdfFile,
  PdfFileUrl,
  PdfOpenDocumentBufferOptions,
  PdfOpenDocumentUrlOptions,
} from '@embedpdf/models';

export interface PDFUrlLoadingOptions {
  type: 'url';
  pdfFile: PdfFileUrl;
  options?: PdfOpenDocumentUrlOptions;
  engine: PdfEngine;
}

export interface PDFBufferLoadingOptions {
  type: 'buffer';
  pdfFile: PdfFile;
  options?: PdfOpenDocumentBufferOptions;
  engine: PdfEngine;
}

export type PDFLoadingOptions = PDFUrlLoadingOptions | PDFBufferLoadingOptions;

export interface PDFLoadingStrategy {
  load(options?: PDFLoadingOptions): Promise<PdfDocumentObject>;
}
