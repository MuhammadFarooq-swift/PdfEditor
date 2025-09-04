'use client'

import React from 'react'
import { MergeDocPage } from './types'
import {
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import { SortablePage } from './sortable-page'
import { Button } from '../../button'
import { DndContext, closestCenter } from '@dnd-kit/core'

interface MergeViewProps {
  pages: MergeDocPage[]
  onDragEnd: (event: DragEndEvent) => void
  onRemovePage: (id: string) => void
  onMerge: () => void
  isMerging: boolean
}

export const MergeView: React.FC<MergeViewProps> = ({
  pages,
  onDragEnd,
  onRemovePage,
  onMerge,
  isMerging,
}) => {
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  )

  return (
    <div className="rounded-md border bg-white p-4">
      <div className="h-[460px] overflow-auto rounded-md bg-gray-50 p-3">
        {pages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">
              Select pages from source documents to add here
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            modifiers={[restrictToParentElement, restrictToVerticalAxis]}
          >
            <SortableContext
              items={pages.map((page) => page.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-2">
                {pages.map((page, index) => (
                  <SortablePage
                    key={page.id}
                    page={page}
                    index={index}
                    isNew={true}
                    onRemove={onRemovePage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          onClick={onMerge}
          className="rounded-md bg-green-500 px-3 py-1.5 text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pages.length === 0 || isMerging}
        >
          {isMerging ? 'Merging...' : 'Merge PDFs'}
        </Button>
      </div>
    </div>
  )
}
