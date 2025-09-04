import { PdfiumEngine } from '@embedpdf/engines'
import { init } from '@embedpdf/pdfium'
import {
  PdfDocumentObject,
  PdfEngine,
  PdfFile,
  PdfTaskHelper,
  Rotation,
} from '@embedpdf/models'

// Singleton instance of the engine
let engineInstance: PdfiumEngine | null = null

/**
 * Initialize the PDF engine and return it
 * Uses a singleton pattern to avoid multiple initializations
 */
export async function initializeEngine(): Promise<PdfEngine> {
  if (engineInstance) return engineInstance

  const response = await fetch('/wasm/pdfium.wasm')
  const wasmBinary = await response.arrayBuffer()

  const wasmModule = await init({ wasmBinary })
  const engine = new PdfiumEngine(wasmModule)

  // Initialize the engine using the task pattern
  const task = engine.initialize
    ? engine.initialize()
    : PdfTaskHelper.resolve(true)

  await new Promise<void>((resolve, reject) => {
    task.wait(
      () => resolve(),
      (error) => reject(error),
    )
  })

  engineInstance = engine
  return engine
}

/**
 * Open a PDF document using the engine
 */
export async function openPdfDocument(
  engine: PdfEngine,
  fileContent: ArrayBuffer,
  password: string = '',
): Promise<PdfDocumentObject> {
  const pdfFile: PdfFile = {
    id: `file-${Math.random().toString(36).substring(2, 9)}`,
    content: fileContent,
  }

  const task = engine.openDocumentBuffer(pdfFile, { password })

  return new Promise<PdfDocumentObject>((resolve, reject) => {
    task.wait(
      (result) => resolve(result),
      (error) => reject(error),
    )
  })
}

/**
 * Close a PDF document using the engine
 */
export async function closePdfDocument(
  engine: PdfEngine,
  doc: PdfDocumentObject,
) {
  const task = engine.closeDocument(doc)
  return new Promise<void>((resolve, reject) => {
    task.wait(
      () => resolve(),
      (error) => reject(error),
    )
  })
}

/**
 * Generate a thumbnail for a page
 */
export async function generateThumbnail(
  engine: PdfEngine,
  doc: PdfDocumentObject,
  pageIndex: number,
  scale: number = 0.5,
): Promise<string> {
  const page = doc.pages[pageIndex]
  const task = engine.renderThumbnail(doc, page, {
    scaleFactor: scale,
    dpr: 1,
    rotation: Rotation.Degree0,
  })

  return new Promise<string>((resolve, reject) => {
    task.wait(
      (result) => {
        const blob = result as Blob

        // Create object URL from the blob
        const blobUrl = URL.createObjectURL(blob)
        resolve(blobUrl)
      },
      (error) => reject(error),
    )
  })
}

/**
 * Merge PDF pages from different documents
 */
export async function mergePdfPages(
  engine: PdfEngine,
  mergeConfigs: Array<{ docId: string; pageIndices: number[] }>,
): Promise<PdfFile> {
  // @ts-ignore - mergePages might not be in the type definition but it exists in the implementation
  const task = engine.mergePages(mergeConfigs)

  return new Promise<PdfFile>((resolve, reject) => {
    task.wait(
      (result) => resolve(result),
      (error) => reject(error),
    )
  })
}
