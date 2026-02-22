'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'tel'
  | 'date'
  | 'time'
  | 'link'
  | 'select'
  | 'multiple'
  | 'checkbox'
  | 'rating'
  | 'linearScale'

export interface BlockType {
  id: string
  label: string
  type: FieldType
  icon: string
  category?: 'questions' | 'layout' | 'embed' | 'advanced'
  description?: string
  example?: { question: string; options?: string[] }
}

const BLOCK_TYPES: BlockType[] = [
  // Questions
  { id: 'short-answer', label: 'Short answer', type: 'text', icon: 'Aa', category: 'questions' },
  { id: 'long-answer', label: 'Long answer', type: 'textarea', icon: '¶', category: 'questions' },
  {
    id: 'multiple-choice',
    label: 'Multiple choice',
    type: 'multiple',
    icon: '✓',
    category: 'questions',
    description: 'Use this to add a question with a range of answer options. Respondents can only choose one answer.',
    example: { question: 'Choose your t-shirt size', options: ['Small', 'Medium', 'Large'] },
  },
  {
    id: 'checkboxes',
    label: 'Checkboxes',
    type: 'checkbox',
    icon: '☑',
    category: 'questions',
    description: 'Allow respondents to select multiple options from a list.',
    example: { question: 'Select your interests', options: ['Technology', 'Design', 'Marketing'] },
  },
  {
    id: 'dropdown',
    label: 'Dropdown',
    type: 'select',
    icon: '▼',
    category: 'questions',
    description: 'A compact list where respondents pick one option from a dropdown menu.',
    example: { question: 'Select your country', options: ['USA', 'UK', 'Canada'] },
  },
  {
    id: 'multi-select',
    label: 'Multi-select',
    type: 'checkbox',
    icon: '☑',
    category: 'questions',
    description: 'Allow respondents to select multiple options from a dropdown-style list.',
    example: { question: 'Select all that apply', options: ['Option A', 'Option B', 'Option C'] },
  },
  { id: 'number', label: 'Number', type: 'number', icon: '#', category: 'questions' },
  { id: 'email', label: 'Email', type: 'email', icon: '@', category: 'questions' },
  { id: 'phone', label: 'Phone number', type: 'tel', icon: '📞', category: 'questions' },
  { id: 'link', label: 'Link', type: 'link', icon: '🔗', category: 'questions' },
  { id: 'date', label: 'Date', type: 'date', icon: '📅', category: 'questions' },
  { id: 'time', label: 'Time', type: 'time', icon: '🕐', category: 'questions' },
  {
    id: 'linear-scale',
    label: 'Linear scale',
    type: 'linearScale',
    icon: '⋮⋮⋮',
    category: 'questions',
    description: 'Rate something on a scale (e.g. 1–5 or 1–10).',
    example: { question: 'How satisfied are you?' },
  },
  {
    id: 'rating',
    label: 'Rating',
    type: 'rating',
    icon: '★',
    category: 'questions',
    description: 'Let respondents rate something on a scale (e.g. 1–5 stars).',
    example: { question: 'How would you rate our service?' },
  },
]

interface InsertBlockModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (block: BlockType) => void
}

export function InsertBlockModal({ isOpen, onClose, onInsert }: InsertBlockModalProps) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showDetailFor, setShowDetailFor] = useState<BlockType | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = search.trim()
    ? BLOCK_TYPES.filter(
        (b) =>
          b.label.toLowerCase().includes(search.toLowerCase()) ||
          b.type.toLowerCase().includes(search.toLowerCase()) ||
          (b.category && b.category.includes(search.toLowerCase()))
      )
    : BLOCK_TYPES

  const selectBlock = useCallback(
    (block: BlockType) => {
      if (block.description && block.example) {
        setShowDetailFor(block)
      } else {
        onInsert(block)
        onClose()
        setSearch('')
        setSelectedIndex(0)
      }
    },
    [onInsert, onClose]
  )

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
      setShowDetailFor(null)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDetailFor) {
        if (e.key === 'Escape') {
          setShowDetailFor(null)
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filtered[selectedIndex]) selectBlock(filtered[selectedIndex])
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filtered, selectBlock, onClose, showDetailFor])

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={() => !showDetailFor && onClose()}
        aria-hidden="true"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 px-4">
        <div
          className="rounded-xl border border-gray-200 bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {showDetailFor ? (
            <FieldTypeDetailModal
              block={showDetailFor}
              onInsert={() => {
                onInsert(showDetailFor)
                onClose()
                setSearch('')
                setShowDetailFor(null)
              }}
              onBack={() => setShowDetailFor(null)}
            />
          ) : (
            <>
              <div className="border-b border-gray-100 p-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for a question type..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-base outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-[400px] overflow-y-auto p-2">
                <p className="mb-2 px-2 text-xs text-gray-500">
                  Use ↑ and ↓ to browse, Enter to insert
                </p>
                <div ref={listRef} className="space-y-0.5">
                  {filtered.map((block, index) => (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => selectBlock(block)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                        index === selectedIndex
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-sm font-medium text-gray-600">
                        {block.icon}
                      </span>
                      <span className="font-medium">{block.label}</span>
                      {block.category && (
                        <span className="ml-auto rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {block.category}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {filtered.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-500">No matching blocks found</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function FieldTypeDetailModal({
  block,
  onInsert,
  onBack,
}: {
  block: BlockType
  onInsert: () => void
  onBack: () => void
}) {
  return (
    <div className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{block.label}</h3>
          {block.description && (
            <p className="mt-1 text-sm text-gray-600">{block.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onInsert}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Insert
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      {block.example && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Example</p>
          <p className="mb-3 font-medium text-gray-900">{block.example.question}</p>
          {block.example.options && (
            <div className="flex flex-wrap gap-2">
              {block.example.options.map((opt, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700"
                >
                  {String.fromCharCode(65 + i)} {opt}
                </span>
              ))}
            </div>
          )}
          {(block.type === 'rating' || block.type === 'linearScale') && (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="text-2xl text-amber-400">
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
