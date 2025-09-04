'use client'

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'

interface PDFViewerProps {
  style?: React.CSSProperties
  className?: string
}

export default function PDFViewer({ style, className }: PDFViewerProps) {
  const [isClient, setIsClient] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load EmbedPDF only on client side
  useEffect(() => {
    if (!isClient || !viewerRef.current) return

    const loadEmbedPDF = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const EmbedPDF = (await import('@embedpdf/snippet')).default

        EmbedPDF.init({
          type: 'container',
          target: viewerRef.current!,
          src: 'https://snippet.embedpdf.com/ebook.pdf',
          worker: true,
        })
      } catch (error) {
        console.error('Failed to load EmbedPDF:', error)
      }
    }

    loadEmbedPDF()
  }, [isClient])

  // Show loading state during SSR and initial client render
  if (!isClient) {
    return (
      <div
        style={{
          height: '600px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div>Loading PDF Viewer...</div>
      </div>
    )
  }

  return (
    <div
      id="pdf-viewer"
      className={className}
      style={{
        ...style,
      }}
      ref={viewerRef}
    />
  )
}
