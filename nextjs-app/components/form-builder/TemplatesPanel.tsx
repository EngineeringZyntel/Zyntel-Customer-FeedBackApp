/**
 * Templates tab content: browse and select a form template
 */

'use client'

import { Button } from '@/components/ui/Button'
import type { FormTemplate } from '@/lib/form-templates'

interface TemplatesPanelProps {
  templates: FormTemplate[]
  onSelect: (template: FormTemplate) => void
}

export function TemplatesPanel({ templates, onSelect }: TemplatesPanelProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Start from a template and customize it. Click &quot;Use template&quot; to apply.
      </p>
      <div className="grid gap-2">
        {templates.map((t) => (
          <div
            key={t.name}
            className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 transition hover:border-[#0066FF]/40 hover:bg-blue-50/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-slate-900">{t.title}</h3>
                {t.industry && (
                  <span className="mt-0.5 inline-block rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">
                    {t.industry}
                  </span>
                )}
                <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">
                  {t.description}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {t.fields.length} field{t.fields.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="shrink-0"
                onClick={() => onSelect(t)}
              >
                Use template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
