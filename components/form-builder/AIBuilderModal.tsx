'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils'

export interface AIGeneratedForm {
  title: string
  description: string
  fields: { label: string; type: string; options?: string[]; maxRating?: number }[]
  message?: string
}

interface AIBuilderModalProps {
  open: boolean
  onClose: () => void
  onApply: (result: AIGeneratedForm) => void
}

export function AIBuilderModal({ open, onClose, onApply }: AIBuilderModalProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setError('')
    setIsGenerating(true)
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch(`${baseUrl}/api/forms/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() || 'A simple contact form with name, email, and message.' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Generation failed')
      onApply(data)
      onClose()
      setPrompt('')
    } catch (e: any) {
      setError(e.message || 'Failed to generate form. Try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl" aria-hidden>✨</span>
            <h2 className="text-xl font-semibold text-gray-900">Create with AI</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Describe the form you want (e.g. &quot;Customer feedback form with name, email, 5-star rating, and comments&quot;) and we&apos;ll generate the fields for you.
          </p>
          <textarea
            className={cn(
              'w-full min-h-[120px] px-3 py-2 border rounded-lg text-sm resize-y',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'placeholder:text-gray-400'
            )}
            placeholder="e.g. Event registration with name, email, phone, ticket type, and dietary options"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              type="button"
              variant="primary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Generating…
                </span>
              ) : (
                'Generate form'
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
