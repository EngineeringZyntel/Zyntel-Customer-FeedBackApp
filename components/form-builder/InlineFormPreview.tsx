/**
 * Inline form preview with Full-page / Embed toggles (OpnForm-style)
 */

'use client'

import { useState } from 'react'
import { FormPreviewBody, type FormPreviewField } from './FormPreviewBody'
import { cn } from '@/lib/utils'

interface InlineFormPreviewProps {
  title: string
  description?: string
  fields: FormPreviewField[]
  logoData?: string
  customization: Record<string, any>
  formLayout?: 'centered' | 'fullWidth'
  submitLabel?: string
}

export function InlineFormPreview({
  title,
  description,
  fields,
  logoData,
  customization,
  formLayout = 'centered',
  submitLabel = 'Submit Feedback',
}: InlineFormPreviewProps) {
  const [mode, setMode] = useState<'fullpage' | 'embed'>('fullpage')

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Preview mode toggles */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <button
          type="button"
          onClick={() => setMode('fullpage')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition',
            mode === 'fullpage'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          )}
        >
          Preview Full-page
        </button>
        <button
          type="button"
          onClick={() => setMode('embed')}
          className={cn(
            'ml-2 rounded-lg px-4 py-2 text-sm font-medium transition',
            mode === 'embed'
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          )}
        >
          Preview Embed
        </button>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'embed' ? (
          <div className="p-4">
            <div className="mx-auto max-w-2xl rounded-xl border-2 border-slate-200 bg-slate-50/50 p-2">
              <p className="mb-2 text-xs font-medium text-slate-500">Embed preview</p>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="max-h-[70vh] overflow-y-auto">
                  <FormPreviewBody
                    title={title}
                    description={description}
                    fields={fields}
                    logoData={logoData}
                    customization={customization}
                    formLayout={formLayout}
                    submitLabel={submitLabel}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <FormPreviewBody
            title={title}
            description={description}
            fields={fields}
            logoData={logoData}
            customization={customization}
            formLayout={formLayout}
            submitLabel={submitLabel}
          />
        )}
      </div>

      {/* Footer branding */}
      <div className="border-t border-slate-100 py-2 pr-4 text-right">
        <p className="text-xs text-slate-400">Powered by Zyntel Feedback</p>
      </div>
    </div>
  )
}
