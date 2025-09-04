'use client'

import React, { useCallback } from 'react'
import { DocumentWithPages, DocumentPage } from './types'
import { VirtualScroller } from './virtual-scroller'
import { Button } from '../../button'
import { PdfEngine } from '@embedpdf/models'

interface DocumentViewProps {
  documents: Record<string, DocumentWithPages>
  onUpdatePages: (docId: string, updates: DocumentPage[]) => void
  onAddSelectedPages: () => void
  onCloseDocument: (docId: string) => void
  engine: PdfEngine
}

export const DocumentView: React.FC<DocumentViewProps> = ({
  documents,
  onUpdatePages,
  onAddSelectedPages,
  onCloseDocument,
  engine,
}) => {
  // Batch select/deselect all pages
  const handleBulkSelection = useCallback(
    (docId: string, shouldSelect: boolean) => {
      const doc = documents[docId]
      if (!doc) return

      // Create a single update with all pages
      const updatedPages = doc.pages.map((page) => ({
        ...page,
        selected: shouldSelect,
      }))

      // Send one batch update
      onUpdatePages(docId, updatedPages)
    },
    [documents, onUpdatePages],
  )

  if (Object.keys(documents).length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-gray-50 p-8 text-center">
        <p className="text-gray-500">Upload PDFs to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(documents).map(([docId, { doc, pages }]) => (
        <div key={docId} className="rounded-md border bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">
                Document {docId.substring(0, 6)} ({pages.length} pages)
              </h3>
              <Button
                onClick={() => onCloseDocument(docId)}
                className="p-1 text-gray-400 transition hover:text-gray-600"
                title="Close document"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleBulkSelection(docId, true)}
                className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700 transition hover:bg-gray-200"
              >
                Select All
              </Button>
              <Button
                onClick={() => handleBulkSelection(docId, false)}
                className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700 transition hover:bg-gray-200"
              >
                Deselect All
              </Button>
            </div>
          </div>

          <VirtualScroller
            items={pages}
            onUpdatePages={(updatedPages) => onUpdatePages(docId, updatedPages)}
            engine={engine}
            doc={doc}
          />

          <div className="mt-3 flex justify-end">
            <Button
              onClick={onAddSelectedPages}
              className="rounded-md bg-red-500 px-3 py-1.5 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!pages.some((page) => page.selected)}
            >
              Add Selected Pages
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
