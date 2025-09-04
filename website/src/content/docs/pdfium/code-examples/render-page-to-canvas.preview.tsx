'use client'
import React, { useEffect, useRef, useState } from 'react'
import { loadPdfDocument } from './render-page-to-canvas'
import { Preview } from '@/components/preview'

// Define the PdfDocument type to match the return value of loadPdfDocument
type PdfDocument = {
  hasPassword: boolean
  pageCount: number
  close: () => void
  getPageCount: () => number
  renderPage: (
    pageIndex: number,
    scale: number,
    rotation: number,
    canvas: HTMLCanvasElement,
    dpr?: number,
  ) => Promise<{ width: number; height: number }>
}

export default function RenderPageToCanvasDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Store both the PDF data and document reference
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null)
  const [pdfDocument, setPdfDocument] = useState<PdfDocument | null>(null)

  // Load PDF on mount
  useEffect(() => {
    loadPdf()
    return () => {
      // Clean up resources when component unmounts
      if (pdfDocument) {
        pdfDocument.close()
      }
    }
  }, [])

  // Render page when document is loaded or page/scale/rotation changes
  useEffect(() => {
    if (pdfDocument && canvasRef.current) {
      renderPage()
    }
  }, [pdfDocument, pageIndex, scale, rotation])

  const loadPdf = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Close any existing document to prevent memory leaks
      if (pdfDocument) {
        pdfDocument.close()
        setPdfDocument(null)
      }

      // Fetch the sample PDF
      const response = await fetch('/ebook.pdf')
      const buffer = await response.arrayBuffer()
      const data = new Uint8Array(buffer)

      // Load the document once
      const doc = await loadPdfDocument(data)

      // Update state with document info
      setPageCount(doc.pageCount)
      setPdfData(data)
      setPdfDocument(doc)
    } catch (err) {
      console.error('Error loading PDF:', err)
      setError(err instanceof Error ? err.message : 'Failed to load PDF')
    } finally {
      setIsLoading(false)
    }
  }

  const renderPage = async () => {
    if (!pdfDocument || !canvasRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      // Use the document reference to render the page - no need to load again
      const result = await pdfDocument.renderPage(
        pageIndex,
        scale,
        rotation,
        canvasRef.current,
      )

      // Update state with results
      setDimensions({
        width: result.width,
        height: result.height,
      })
    } catch (err) {
      console.error('Error rendering page:', err)
      setError(err instanceof Error ? err.message : 'Failed to render page')
    } finally {
      setIsLoading(false)
    }
  }

  const goToNextPage = () => {
    if (pageIndex < pageCount - 1) {
      setPageIndex(pageIndex + 1)
    }
  }

  const goToPrevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1)
    }
  }

  const zoomIn = () => {
    setScale(Math.min(scale * 1.2, 5))
  }

  const zoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.1))
  }

  const rotate = () => {
    setRotation((rotation + 90) % 360)
  }

  return (
    <Preview title="Render PDF Page to Canvas">
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <div className="flex overflow-hidden rounded-md border border-gray-300">
            <button
              onClick={goToPrevPage}
              disabled={pageIndex === 0 || isLoading || pageCount === 0}
              className="border-r border-gray-300 bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
              title="Previous page"
            >
              ←
            </button>
            <div className="bg-white px-3 py-1">
              {pageCount > 0
                ? `Page ${pageIndex + 1} of ${pageCount}`
                : 'Loading...'}
            </div>
            <button
              onClick={goToNextPage}
              disabled={
                pageIndex === pageCount - 1 || isLoading || pageCount === 0
              }
              className="border-l border-gray-300 bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
              title="Next page"
            >
              →
            </button>
          </div>

          <div className="flex overflow-hidden rounded-md border border-gray-300">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.25 || isLoading}
              className="border-r border-gray-300 bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
              title="Zoom out"
            >
              -
            </button>
            <div className="bg-white px-3 py-1">{Math.round(scale * 100)}%</div>
            <button
              onClick={zoomIn}
              disabled={scale >= 3.0 || isLoading}
              className="border-l border-gray-300 bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
              title="Zoom in"
            >
              +
            </button>
          </div>

          <button
            onClick={rotate}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
            title="Rotate 90°"
          >
            Rotate {rotation}°
          </button>
        </div>

        {/* Canvas */}
        <div className="relative max-h-[500px] overflow-auto rounded-md border border-gray-300 bg-gray-100 p-4">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
                <span>Loading...</span>
              </div>
            </div>
          )}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="shadow-md"
              style={{ display: dimensions.width > 0 ? 'block' : 'none' }}
            />
          </div>
        </div>

        {/* Dimensions info */}
        {dimensions.width > 0 && (
          <div className="text-sm text-gray-600">
            Canvas dimensions: {dimensions.width} × {dimensions.height} pixels
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="rounded-md border border-red-300 bg-red-100 p-3 text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </Preview>
  )
}
