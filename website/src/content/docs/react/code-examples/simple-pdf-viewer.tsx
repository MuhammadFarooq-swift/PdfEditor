'use client'

import { createPluginRegistration } from '@embedpdf/core'
import { EmbedPDF } from '@embedpdf/core/react'
import { usePdfiumEngine } from '@embedpdf/engines/react'

// Import the essential plugins
import { ViewportPluginPackage } from '@embedpdf/plugin-viewport/react'
import { Viewport } from '@embedpdf/plugin-viewport/react'
import { ScrollPluginPackage } from '@embedpdf/plugin-scroll/react'
import { Scroller } from '@embedpdf/plugin-scroll/react'
import { LoaderPluginPackage } from '@embedpdf/plugin-loader/react'
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react'

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
]

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
        <Viewport
          style={{
            backgroundColor: '#f1f3f5',
          }}
        >
          <Scroller
            renderPage={({ width, height, pageIndex }) => (
              <div style={{ width, height }}>
                {/* The RenderLayer is responsible for drawing the page */}
                <RenderLayer pageIndex={pageIndex} />
              </div>
            )}
          />
        </Viewport>
      </EmbedPDF>
    </div>
  )
}
