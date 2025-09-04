import { initializePdfium } from './initialize-pdfium'

async function getPdfPageCount(pdfData: Uint8Array) {
  // Step 1: Initialize PDFium
  const pdfium = await initializePdfium()

  // Step 2: Load the PDF document
  const filePtr = pdfium.pdfium.wasmExports.malloc(pdfData.length)
  pdfium.pdfium.HEAPU8.set(pdfData, filePtr)
  const docPtr = pdfium.FPDF_LoadMemDocument(filePtr, pdfData.length, '')

  if (!docPtr) {
    const error = pdfium.FPDF_GetLastError()
    pdfium.pdfium.wasmExports.free(filePtr)
    throw new Error(`Failed to load PDF: ${error}`)
  }

  try {
    // Step 3: Get the page count
    const pageCount = pdfium.FPDF_GetPageCount(docPtr)
    return pageCount
  } finally {
    // Step 4: Clean up
    pdfium.FPDF_CloseDocument(docPtr)
    pdfium.pdfium.wasmExports.free(filePtr)
  }
}

export { getPdfPageCount }
