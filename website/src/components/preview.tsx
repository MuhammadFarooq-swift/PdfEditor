import React, { ReactNode } from 'react'
import cn from 'clsx'
import { EyeIcon } from 'lucide-react'

interface PreviewProps {
  title: string
  children: ReactNode
}

export function Preview({ title, children }: PreviewProps) {
  return (
    <div className="not-first:mt-6">
      <div
        className={cn(
          'flex h-12 items-center gap-2 rounded-t-md border border-b-0 border-gray-300 bg-gray-100 px-4 text-xs text-gray-700 contrast-more:border-gray-900',
        )}
      >
        <EyeIcon className="h-4 w-4" />
        <span className="text-xs font-bold text-gray-500">PREVIEW:</span>
        <span className="truncate">{title}</span>
      </div>
      <div className="focus-visible:nextra-focus not-prose group flex flex-col gap-2 overflow-x-auto rounded-b-md bg-white p-4 text-[.9em] subpixel-antialiased ring-1 ring-inset ring-gray-300 contrast-more:ring-gray-900 contrast-more:contrast-150">
        {children}
      </div>
    </div>
  )
}
