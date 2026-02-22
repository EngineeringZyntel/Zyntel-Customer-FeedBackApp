'use client'

import { cn } from '@/lib/utils'

export type LayoutBlockType = 'divider' | 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'title' | 'label'

const LAYOUT_BLOCKS: { type: LayoutBlockType; label: string; icon: string }[] = [
  { type: 'divider', label: 'Divider', icon: '—' },
  { type: 'heading1', label: 'H1', icon: 'H1' },
  { type: 'heading2', label: 'H2', icon: 'H2' },
  { type: 'heading3', label: 'H3', icon: 'H3' },
  { type: 'paragraph', label: 'Text', icon: 'T' },
  { type: 'title', label: 'Title', icon: '📌' },
  { type: 'label', label: 'Label', icon: '🏷' },
]

export interface LayoutBlock {
  type: LayoutBlockType
  label: string
}

interface LayoutToolbarProps {
  onInsert: (block: LayoutBlock) => void
  className?: string
}

export function LayoutToolbar({ onInsert, className }: LayoutToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-2',
        className
      )}
    >
      <span className="mr-2 text-xs font-medium text-gray-500">Add layout:</span>
      {LAYOUT_BLOCKS.map((block) => (
        <button
          key={block.type}
          type="button"
          onClick={() =>
            onInsert({
              type: block.type,
              label:
                block.type === 'divider'
                  ? ''
                  : block.type === 'heading1'
                  ? 'Heading 1'
                  : block.type === 'heading2'
                  ? 'Heading 2'
                  : block.type === 'heading3'
                  ? 'Heading 3'
                  : block.type === 'paragraph'
                  ? 'Enter your text here...'
                  : block.type === 'title'
                  ? 'Section title'
                  : block.type === 'label'
                  ? 'Label text'
                  : block.label,
            })
          }
          title={block.label}
          className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-white hover:text-gray-900"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-white text-[10px] font-bold shadow-sm">
            {block.icon}
          </span>
          {block.label}
        </button>
      ))}
    </div>
  )
}
