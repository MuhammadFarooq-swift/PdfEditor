'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '../../button'
import { MergeDocPage } from './types'

interface SortablePageProps {
  page: MergeDocPage
  index: number
  isNew?: boolean
  onRemove?: (id: string) => void
}

export const SortablePage: React.FC<SortablePageProps> = ({
  page,
  index,
  isNew,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: page.id,
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative mb-2 cursor-move rounded-md border border-gray-200 bg-white p-2"
      {...attributes}
      {...listeners}
    >
      <div className="absolute right-1 top-1 flex space-x-1">
        {onRemove && (
          <Button
            onClick={() => onRemove(page.id)}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
          >
            ×
          </Button>
        )}
        <span className="rounded-full bg-gray-200 px-1.5 text-xs">
          {index + 1}
        </span>
      </div>
      {page.thumbnail ? (
        <img
          src={page.thumbnail}
          alt={`Page ${index + 1}`}
          className="h-auto w-full object-contain"
        />
      ) : (
        <div className="flex aspect-[0.7] w-full animate-pulse items-center justify-center bg-gray-100 text-sm text-gray-400">
          Loading...
        </div>
      )}
    </div>
  )
}
