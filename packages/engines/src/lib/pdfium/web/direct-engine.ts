import { Logger } from '@embedpdf/models';
import { init } from '@embedpdf/pdfium';

import { PdfiumEngine } from '../engine';

export async function createPdfiumEngine(wasmUrl: string, logger?: Logger): Promise<PdfiumEngine> {
  const response = await fetch(wasmUrl);
  const wasmBinary = await response.arrayBuffer();
  const wasmModule = await init({ wasmBinary });
  return new PdfiumEngine(wasmModule, { logger });
}
