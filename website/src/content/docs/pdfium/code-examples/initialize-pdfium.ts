import { init, WrappedPdfiumModule } from '@embedpdf/pdfium'

const pdfiumWasm = '/wasm/pdfium.wasm'

let pdfiumInstance: WrappedPdfiumModule | null = null

async function initializePdfium() {
  if (pdfiumInstance) return pdfiumInstance

  const response = await fetch(pdfiumWasm)
  const wasmBinary = await response.arrayBuffer()
  pdfiumInstance = await init({ wasmBinary })

  pdfiumInstance.PDFiumExt_Init()

  return pdfiumInstance
}

export { initializePdfium }
