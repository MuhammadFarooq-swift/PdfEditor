import { initializePdfium } from './initialize-pdfium'

export async function openProtectedPdf(pdfData: Uint8Array, password?: string) {
  // Step 1: Initialize PDFium
  const pdfium = await initializePdfium()

  // Step 2: Load the PDF document
  const filePtr = pdfium.pdfium.wasmExports.malloc(pdfData.length)
  pdfium.pdfium.HEAPU8.set(pdfData, filePtr)

  // Try to load the PDF document with optional password
  const docPtr = pdfium.FPDF_LoadMemDocument(
    filePtr,
    pdfData.length,
    password || '',
  )

  // Check if document loaded successfully
  if (!docPtr) {
    const errorCode = pdfium.FPDF_GetLastError()
    pdfium.pdfium.wasmExports.free(filePtr)

    // Map error code to a message
    let errorMessage
    switch (errorCode) {
      case 0:
        errorMessage = 'No error'
        break
      case 1:
        errorMessage = 'Unknown error'
        break
      case 2:
        errorMessage = 'File not found or could not be opened'
        break
      case 3:
        errorMessage = 'File not in PDF format or corrupted'
        break
      case 4:
        errorMessage = 'Password required or incorrect password'
        break
      case 5:
        errorMessage = 'Unsupported security scheme'
        break
      case 6:
        errorMessage = 'Page not found or content error'
        break
      case 7:
        errorMessage = 'XFA load error'
        break
      case 8:
        errorMessage = 'XFA layout error'
        break
      default:
        errorMessage = `Unknown error code: ${errorCode}`
        break
    }

    // Return error details
    return {
      success: false,
      errorCode,
      errorMessage,
    }
  }

  try {
    // Document loaded successfully - get basic info
    const pageCount = pdfium.FPDF_GetPageCount(docPtr)

    return {
      success: true,
      pageCount,
      errorCode: 0,
      errorMessage: 'PDF opened successfully',
    }
  } finally {
    // Clean up resources
    pdfium.FPDF_CloseDocument(docPtr)
    pdfium.pdfium.wasmExports.free(filePtr)
  }
}
