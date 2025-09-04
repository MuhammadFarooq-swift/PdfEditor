import '@/styles/tailwind.css'
import Navbar from '@/components/navbar'
import { ConfigProvider } from '@/components/stores/config'
import { getPageMap } from 'nextra/page-map'

export const metadata = {
  title: 'EmbedPDF: The Lightweight JavaScript PDF Viewer for Any Framework',
  description:
    'EmbedPDF is an open-source JavaScript PDF viewer that seamlessly integrates with React, Vue, Angular, Svelte, or vanilla JS. Lightweight (3.2kb gzipped), customizable, and framework-agnostic. Display, annotate, and navigate PDF documents with ease.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: `/site.webmanifest`,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let pageMap = await getPageMap()

  return (
    <html lang="en">
      <body>
        <ConfigProvider navbar={<Navbar />} pageMap={pageMap}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  )
}
