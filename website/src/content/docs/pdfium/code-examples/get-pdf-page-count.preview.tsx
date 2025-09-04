'use client'
import React, { useState } from 'react'
import { getPdfPageCount } from './get-pdf-page-count'
import { Preview } from '@/components/preview'

export default function GetPdfPageCountDemo() {
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/ebook.pdf')
      const buffer = await response.arrayBuffer()
      const count = await getPdfPageCount(new Uint8Array(buffer))

      setPageCount(count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Preview title="Get PDF Page Count">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="rounded-md bg-violet-800 px-4 py-2 text-white hover:bg-violet-900 disabled:bg-gray-400"
      >
        {isLoading ? 'Loading...' : 'Get PDF Page Count'}
      </button>

      {pageCount !== null && (
        <div className="mt-2 rounded-md border border-green-500 bg-green-50 p-4 text-green-700">
          <p>PDF opened successfully!</p>
          <p>Number of pages: {pageCount}</p>
        </div>
      )}

      {error && <p className="text-red-500">Error: {error}</p>}
    </Preview>
  )
}
