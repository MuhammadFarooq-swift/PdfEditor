'use client'

import React from 'react'

interface MergeResultProps {
  mergedPdfUrl: string
  onReset: () => void
}

export const MergeResult: React.FC<MergeResultProps> = ({
  mergedPdfUrl,
  onReset,
}) => {
  return (
    <div className="mb-6 rounded-md border bg-gray-50 p-4">
      <h2 className="mb-4 text-xl font-semibold">Your merged PDF is ready!</h2>
      <div className="flex space-x-4">
        <a
          href={mergedPdfUrl}
          download="merged-document.pdf"
          className="rounded-md bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
        >
          Download PDF
        </a>
        <button
          onClick={onReset}
          className="rounded-md bg-gray-500 px-4 py-2 text-white transition hover:bg-gray-600"
        >
          Create Another
        </button>
      </div>
    </div>
  )
}
