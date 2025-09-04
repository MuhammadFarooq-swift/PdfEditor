'use client'

import { createPluginRegistration } from '@embedpdf/core'
import { EmbedPDF } from '@embedpdf/core/react'
import { usePdfiumEngine } from '@embedpdf/engines/react'

// Import the essential plugins
import {
  Viewport,
  ViewportPluginPackage,
} from '@embedpdf/plugin-viewport/react'
import { Scroller, ScrollPluginPackage } from '@embedpdf/plugin-scroll/react'
import { LoaderPluginPackage } from '@embedpdf/plugin-loader/react'
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react'
import { useZoom, ZoomPluginPackage } from '@embedpdf/plugin-zoom/react'

// 1. Register the plugins you need
const plugins = [
  createPluginRegistration(LoaderPluginPackage, {
    loadingOptions: {
      type: 'url',
      pdfFile: {
        id: 'example-pdf',
        url: 'https://snippet.embedpdf.com/ebook.pdf',
      },
    },
  }),
  createPluginRegistration(ViewportPluginPackage),
  createPluginRegistration(ScrollPluginPackage),
  createPluginRegistration(RenderPluginPackage),
  createPluginRegistration(ZoomPluginPackage),
]

export const ZoomToolbar = () => {
  const { provides: zoomProvides, state: zoomState } = useZoom()

  if (!zoomProvides) {
    return null
  }

  return (
    <div className="mb-4 mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      {/* Zoom Level Display */}
      <div className="flex items-center gap-2">
        <span className="tracking-wide text-xs font-medium uppercase text-gray-600">
          Zoom
        </span>
        <div className="min-w-[60px] rounded border border-gray-200 bg-gray-50 px-2 py-1 text-center font-mono text-sm text-gray-800">
          {Math.round(zoomState.currentZoomLevel * 100)}%
        </div>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200"></div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors duration-150 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
          onClick={zoomProvides.zoomOut}
          title="Zoom Out"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14" />
          </svg>
        </button>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors duration-150 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
          onClick={zoomProvides.zoomIn}
          title="Zoom In"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <button
          className="ml-1 flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors duration-150 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100"
          onClick={() => zoomProvides.requestZoom(1.0)}
          title="Reset Zoom to 100%"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export const PDFViewer = () => {
  // 2. Initialize the engine with the React hook
  const { engine, isLoading } = usePdfiumEngine()

  if (isLoading || !engine) {
    return <div>Loading PDF Engine...</div>
  }

  // 3. Wrap your UI with the <EmbedPDF> provider
  return (
    <div style={{ height: '500px' }}>
      <EmbedPDF engine={engine} plugins={plugins}>
        <div className="flex h-full flex-col">
          <ZoomToolbar />
          <Viewport
            style={{
              backgroundColor: '#f1f3f5',
            }}
          >
            <Scroller
              renderPage={({ width, height, pageIndex, scale }) => (
                <div style={{ width, height }}>
                  {/* The RenderLayer is responsible for drawing the page */}
                  <RenderLayer pageIndex={pageIndex} scaleFactor={scale} />
                </div>
              )}
            />
          </Viewport>
        </div>
      </EmbedPDF>
    </div>
  )
}
