import { initializePdfium } from './initialize-pdfium'

/**
 * Loads a PDF document and returns an object with methods to access and extract text from it.
 * This example focuses solely on extracting text from PDF pages.
 */
export async function loadPdfForTextExtraction(pdfData: Uint8Array) {
  // Initialize PDFium
  const pdfium = await initializePdfium()

  // Allocate memory for the PDF data
  const filePtr = pdfium.pdfium.wasmExports.malloc(pdfData.length)
  pdfium.pdfium.HEAPU8.set(pdfData, filePtr)

  // Load the document
  const docPtr = pdfium.FPDF_LoadMemDocument(filePtr, pdfData.length, '')

  if (!docPtr) {
    const error = pdfium.FPDF_GetLastError()
    pdfium.pdfium.wasmExports.free(filePtr)

    // Handle password-protected documents
    if (error === 4) {
      return {
        hasPassword: true,
        pageCount: 0,
        close: () => {}, // No-op since no document was loaded
        extractText: async () => {
          throw new Error('Document is password protected')
        },
      }
    }

    throw new Error(`Failed to load PDF: ${error}`)
  }

  // Get page count
  const pageCount = pdfium.FPDF_GetPageCount(docPtr)

  // Return an object with document info and text extraction capabilities
  return {
    hasPassword: false,
    pageCount,

    // Close the document and free resources
    close: () => {
      pdfium.FPDF_CloseDocument(docPtr)
      pdfium.pdfium.wasmExports.free(filePtr)
    },

    // Extract all text from a specific page
    extractText: async (pageIndex: number): Promise<string> => {
      // Check if the page index is valid
      if (pageIndex < 0 || pageIndex >= pageCount) {
        throw new Error(
          `Invalid page index: ${pageIndex}. Document has ${pageCount} pages.`,
        )
      }

      // Load the page for rendering
      const pagePtr = pdfium.FPDF_LoadPage(docPtr, pageIndex)
      if (!pagePtr) {
        throw new Error(`Failed to load page ${pageIndex}`)
      }

      try {
        // Load the page text (a separate structure for text extraction)
        const textPagePtr = pdfium.FPDFText_LoadPage(pagePtr)
        if (!textPagePtr) {
          throw new Error(`Failed to load text for page ${pageIndex}`)
        }

        try {
          // Get the character count on the page
          const charCount = pdfium.FPDFText_CountChars(textPagePtr)
          if (charCount <= 0) {
            return '' // No text on this page or error
          }

          // Allocate a buffer for the text (+1 for null terminator)
          const bufferSize = (charCount + 1) * 2 // UTF-16, 2 bytes per character
          const textBufferPtr = pdfium.pdfium.wasmExports.malloc(bufferSize)

          try {
            // Extract the text (PDFium uses UTF-16LE encoding)
            const extractedLength = pdfium.FPDFText_GetText(
              textPagePtr,
              0, // Start index
              charCount, // Character count to extract
              textBufferPtr, // Output buffer
            )

            // If text was extracted, convert from UTF-16LE to JavaScript string
            if (extractedLength > 0) {
              // Convert UTF-16 array to JavaScript string
              return pdfium.pdfium.UTF16ToString(textBufferPtr)
            }

            return '' // No text extracted
          } finally {
            // Clean up text buffer
            pdfium.pdfium.wasmExports.free(textBufferPtr)
          }
        } finally {
          // Clean up text page
          pdfium.FPDFText_ClosePage(textPagePtr)
        }
      } finally {
        // Clean up page
        pdfium.FPDF_ClosePage(pagePtr)
      }
    },
  }
}
