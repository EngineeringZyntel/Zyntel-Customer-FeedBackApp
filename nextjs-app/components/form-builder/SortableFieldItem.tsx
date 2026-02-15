'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ReactNode } from 'react'

interface SortableFieldItemProps {
  id: string
  children: ReactNode
}

export function SortableFieldItem({ id, children }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="space-y-2">
      <div className="border border-border rounded-lg p-4 bg-bg-secondary relative">
        {/* Drag handle */}
        <button
          type="button"
          className="absolute left-2 top-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          {...attributes}
          {...listeners}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
        
        <div className="ml-8">
          {children}
        </div>
      </div>
    </div>
  )
}
