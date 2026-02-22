/**
 * OpnForm-style form builder layout: top nav, left config panel, right live preview
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { InlineFormPreview } from './InlineFormPreview'
import type { FormPreviewField } from './FormPreviewBody'
import { cn } from '@/lib/utils'

interface FormBuilderOpnFormLayoutProps {
  /** Back link (e.g. /dashboard or /dashboard/forms/1) */
  backHref: string
  /** Form title shown in left panel (editable in Information section) */
  formTitle: string
  /** Optional "Edited X ago" under title (edit mode) */
  editedAt?: string
  /** Save button click and loading state */
  onSave: () => void
  isSaving?: boolean
  /** Content for Information collapsible: Form Title, Description, Tags, Copy settings */
  informationSection: React.ReactNode
  /** Content for Form Structure collapsible: add fields + field list */
  formStructureSection: React.ReactNode
  /** Content for Customization collapsible */
  customizationSection: React.ReactNode
  /** Optional Templates tab content (browse and use templates) */
  templatesSection?: React.ReactNode
  /** Preview data for right panel */
  preview: {
    title: string
    description?: string
    fields: FormPreviewField[]
    logoData?: string
    customization: Record<string, any>
    formLayout?: 'centered' | 'fullWidth'
    submitLabel?: string
  }
  /** Extra top bar content (e.g. AI button) */
  topBarExtra?: React.ReactNode
}

export function FormBuilderOpnFormLayout({
  backHref,
  formTitle,
  editedAt,
  onSave,
  isSaving,
  informationSection,
  formStructureSection,
  customizationSection,
  templatesSection,
  preview,
  topBarExtra,
}: FormBuilderOpnFormLayoutProps) {
  const [templatesOpen, setTemplatesOpen] = useState(!!templatesSection)
  const [infoOpen, setInfoOpen] = useState(true)
  const [structureOpen, setStructureOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Top bar – OpnForm-style */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <Link href="/dashboard" className="text-lg font-semibold text-[#0066FF]">
          Zyntel Feedback
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/help" className="text-sm text-slate-600 hover:text-slate-900">
            Help &amp; Support
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/dashboard/create">
            <Button variant="primary" size="sm">
              + Create a new form
            </Button>
          </Link>
          {topBarExtra}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0066FF] text-xs font-medium text-white">
              U
            </span>
            My forms
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left column – configuration panel (light grey) */}
        <aside className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-slate-100">
          <div className="border-b border-slate-200 bg-white p-4">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            >
              ← Go back
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">
              {formTitle || 'Untitled form'}
            </h1>
            {editedAt && (
              <p className="mt-0.5 text-sm text-slate-500">{editedAt}</p>
            )}
            <Button
              type="button"
              variant="primary"
              className="mt-4 w-full"
              onClick={onSave}
              isLoading={isSaving}
            >
              <span className="mr-2">✓</span>
              Save changes
            </Button>
          </div>

          {/* Collapsible: Templates (optional) */}
          {templatesSection && (
            <div className="border-b border-slate-200">
              <button
                type="button"
                onClick={() => setTemplatesOpen(!templatesOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-200/60"
              >
                <span className="flex items-center gap-2">
                  <span className="text-slate-500">📋</span>
                  Templates
                </span>
                <span className="text-slate-400">{templatesOpen ? '▲' : '▼'}</span>
              </button>
              {templatesOpen && (
                <div className="max-h-[45vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4">
                  {templatesSection}
                </div>
              )}
            </div>
          )}

          {/* Collapsible: Information */}
          <div className="border-b border-slate-200">
            <button
              type="button"
              onClick={() => setInfoOpen(!infoOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-200/60"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-xs text-slate-600">i</span>
                Information
              </span>
              <span className="text-slate-400">{infoOpen ? '▲' : '▼'}</span>
            </button>
            {infoOpen && (
              <div className="border-t border-slate-200 bg-white px-4 py-4">
                {informationSection}
              </div>
            )}
          </div>

          {/* Collapsible: Form Structure */}
          <div className="border-b border-slate-200">
            <button
              type="button"
              onClick={() => setStructureOpen(!structureOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-200/60"
            >
              <span className="flex items-center gap-2">
                <span className="text-slate-500">🔗</span>
                Form Structure
              </span>
              <span className="text-slate-400">{structureOpen ? '▲' : '▼'}</span>
            </button>
            {structureOpen && (
              <div className="max-h-[50vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4">
                {formStructureSection}
              </div>
            )}
          </div>

          {/* Collapsible: Customization */}
          <div className="border-b border-slate-200">
            <button
              type="button"
              onClick={() => setCustomOpen(!customOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 hover:bg-slate-200/60"
            >
              <span className="flex items-center gap-2">
                <span className="text-slate-500">🎨</span>
                Customization
              </span>
              <span className="text-slate-400">{customOpen ? '▲' : '▼'}</span>
            </button>
            {customOpen && (
              <div className="max-h-[50vh] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4">
                {customizationSection}
              </div>
            )}
          </div>
        </aside>

        {/* Right column – live preview */}
        <main className="min-w-0 flex-1">
          <InlineFormPreview
            title={preview.title}
            description={preview.description}
            fields={preview.fields}
            logoData={preview.logoData}
            customization={preview.customization}
            formLayout={preview.formLayout}
            submitLabel={preview.submitLabel}
          />
        </main>
      </div>
    </div>
  )
}
