/**
 * Create Form Page
 * Tally-style form builder: left sidebar (fields + layout + settings), center canvas, right sidebar (customize).
 * Preview (view only) and Publish (save) buttons in top bar.
 */

'use client'

import { useState, useEffect, type FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  type FieldType as SidebarFieldType,
  type FormLayoutOption,
} from '@/components/form-builder/FormBuilderLeftSidebar'
import { FORM_TEMPLATES } from '@/lib/form-templates'
import {
  FormBuilderRightSidebar,
  type FormCustomization,
} from '@/components/form-builder/FormBuilderRightSidebar'
import type { FormHeaderConfig } from '@/components/form-builder/FormHeaderSection'
import { FormBuilderOpnFormLayout } from '@/components/form-builder/FormBuilderOpnFormLayout'
import { FormStructureSection } from '@/components/form-builder/FormStructureSection'
import { TemplatesPanel } from '@/components/form-builder/TemplatesPanel'
import { AIBuilderModal, type AIGeneratedForm } from '@/components/form-builder/AIBuilderModal'
import { formsApi } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface FormField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
  scaleLabels?: { min: string; max: string }
}


function CreateFormPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [thankYouMessage, setThankYouMessage] = useState('')
  const [thankYouRedirectUrl, setThankYouRedirectUrl] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [responseLimit, setResponseLimit] = useState<number | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null)
  const [customization, setCustomization] = useState<FormCustomization>({})
  const [logoData, setLogoData] = useState<string | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [formLayout, setFormLayout] = useState<FormLayoutOption>('centered')

  useEffect(() => {
    if (searchParams.get('ai') === '1') setShowAIModal(true)
  }, [searchParams])

  const headerConfig: FormHeaderConfig = {
    logoData: logoData ?? undefined,
    headerTitle: title,
    headerSubtext: description ?? undefined,
    headerBackgroundColor: customization.headerBackgroundColor,
  }

  const applyTemplate = (t: (typeof FORM_TEMPLATES)[number]) => {
    setTitle(t.title)
    setDescription(t.description)
    setFields(t.fields.map((f) => ({ ...f, options: f.options ? [...f.options] : undefined })))
  }

  const applyAIGenerated = (result: AIGeneratedForm) => {
    setTitle(result.title)
    setDescription(result.description)
    setFields(
      (result.fields || []).map((f) => ({
        label: f.label,
        type: f.type,
        options: f.options ? [...f.options] : undefined,
        maxRating: f.maxRating,
      }))
    )
    setError('')
  }

  const onHeaderChange = (config: FormHeaderConfig) => {
    setTitle(config.headerTitle)
    setDescription(config.headerSubtext ?? '')
    setLogoData(config.logoData ?? null)
    if (config.headerBackgroundColor !== undefined) {
      setCustomization((c) => ({ ...c, headerBackgroundColor: config.headerBackgroundColor }))
    }
  }

  /** Add a field from the left sidebar (field type or layout block); inserts at insertAtIndex or end */
  const handleAddFieldFromSidebar = (fieldType: SidebarFieldType) => {
    const defaults: Record<string, FormField> = {
      text: { label: '', type: 'text' },
      textarea: { label: '', type: 'textarea' },
      email: { label: 'Email', type: 'email' },
      number: { label: '', type: 'number' },
      tel: { label: 'Phone number', type: 'tel' },
      date: { label: 'Date', type: 'date' },
      time: { label: 'Time', type: 'time' },
      link: { label: 'Website URL', type: 'link' },
      select: { label: '', type: 'select', options: ['Option 1', 'Option 2'] },
      multiple: { label: '', type: 'multiple', options: ['Option 1', 'Option 2'] },
      checkbox: { label: '', type: 'checkbox', options: ['Option 1', 'Option 2'] },
      rating: { label: '', type: 'rating', maxRating: 5 },
      linearScale: { label: '', type: 'linearScale', maxRating: 5 },
      heading1: { label: 'Heading 1', type: 'heading1' },
      heading2: { label: 'Heading 2', type: 'heading2' },
      heading3: { label: 'Heading 3', type: 'heading3' },
      title: { label: 'Section title', type: 'title' },
      paragraph: { label: 'Enter your text here...', type: 'paragraph' },
      label: { label: 'Label text', type: 'label' },
      divider: { label: '', type: 'divider' },
    }
    const def = defaults[fieldType.type] ?? { label: fieldType.label, type: fieldType.type }
    const idx = insertAtIndex ?? fields.length
    const next = [...fields]
    next.splice(idx, 0, { ...def })
    setFields(next)
    setInsertAtIndex(null)
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], ...updates }
    const field = updated[index]
    if (['select', 'multiple', 'checkbox'].includes(field.type)) {
      if (!field.options || field.options.filter((o) => o?.trim()).length === 0) {
        field.options = ['Option 1', 'Option 2']
      }
    }
    setFields(updated)
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const addOption = (fieldIndex: number) => {
    const updated = [...fields]
    if (!updated[fieldIndex].options) {
      updated[fieldIndex].options = []
    }
    updated[fieldIndex].options = [...updated[fieldIndex].options!, '']
    setFields(updated)
  }

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updated = [...fields]
    if (updated[fieldIndex].options) {
      updated[fieldIndex].options![optionIndex] = value
      setFields(updated)
    }
  }

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...fields]
    if (updated[fieldIndex].options) {
      updated[fieldIndex].options = updated[fieldIndex].options!.filter((_, i) => i !== optionIndex)
      setFields(updated)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Form title is required')
      return
    }


    const displayOnlyTypes = ['paragraph', 'heading1', 'heading2', 'heading3', 'divider', 'title', 'label']
    const inputFieldTypes = fields.filter((f) => !displayOnlyTypes.includes(f.type))

    if (inputFieldTypes.length === 0) {
      setError('Add at least one input field (not just layout blocks)')
      return
    }

    for (const field of fields) {
      if (displayOnlyTypes.includes(field.type)) continue
      if (!field.label?.trim()) {
        setError(`Field at position ${fields.indexOf(field) + 1} must have a label`)
        return
      }
      if ((field.type === 'select' || field.type === 'multiple' || field.type === 'checkbox') && (!field.options || field.options.filter((o) => o?.trim()).length === 0)) {
        setError(`"${field.label}" must have at least one option`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      const response = await formsApi.create({
        title,
        description,
        logoData: logoData ?? undefined,
        customization: Object.keys(customization).length ? customization : undefined,
        fields: fields.map((f) => ({
          label: f.label || '',
          type: f.type,
          options: f.options?.filter((opt) => opt?.trim()),
          maxRating: f.maxRating ?? (f.type === 'linearScale' ? 5 : 5),
        })),
        thankYouMessage: thankYouMessage.trim() || undefined,
        thankYouRedirectUrl: thankYouRedirectUrl.trim() || undefined,
        closeDate: closeDate ? new Date(closeDate).toISOString() : undefined,
        responseLimit: responseLimit === '' ? undefined : Number(responseLimit),
      })
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveForm = (e?: React.FormEvent) => {
    e?.preventDefault()
    handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
  }

  return (
    <>
      <AIBuilderModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApply={applyAIGenerated}
      />

      <FormBuilderOpnFormLayout
        backHref="/dashboard"
        formTitle={title || 'Untitled form'}
        onSave={() => saveForm()}
        isSaving={isSubmitting}
        informationSection={
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Form Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Customer Feedback"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit."
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
              <input
                type="text"
                placeholder="Add tags"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-slate-500">To organize your forms (hidden to respondents).</p>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <p className="mb-2 text-xs font-medium text-slate-500">Form settings</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-slate-600">Thank-you message</label>
                  <textarea
                    value={thankYouMessage}
                    onChange={(e) => setThankYouMessage(e.target.value)}
                    placeholder="Thanks for your feedback!"
                    rows={2}
                    className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600">Redirect URL (optional)</label>
                  <input
                    type="url"
                    value={thankYouRedirectUrl}
                    onChange={(e) => setThankYouRedirectUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600">Close date (optional)</label>
                  <input
                    type="datetime-local"
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                    className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600">Response limit (optional)</label>
                  <input
                    type="number"
                    min={1}
                    value={responseLimit === '' ? '' : responseLimit}
                    onChange={(e) => setResponseLimit(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 100"
                    className="mt-0.5 w-full rounded border border-slate-200 px-2 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        }
        formStructureSection={
          <FormStructureSection
            fields={fields}
            onAddField={handleAddFieldFromSidebar}
            updateField={updateField}
            removeField={removeField}
            addOption={addOption}
            updateOption={updateOption}
            removeOption={removeOption}
            onReorder={setFields}
          />
        }
        templatesSection={
          <TemplatesPanel templates={FORM_TEMPLATES} onSelect={applyTemplate} />
        }
        customizationSection={
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Form layout</label>
              <select
                value={formLayout}
                onChange={(e) => setFormLayout(e.target.value as FormLayoutOption)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="centered">Centered card</option>
                <option value="fullWidth">Full width</option>
              </select>
            </div>
            <FormBuilderRightSidebar
              headerConfig={headerConfig}
              customization={customization}
              onHeaderChange={onHeaderChange}
              onCustomizationChange={setCustomization}
              dashboardHref=""
              inline
              initialTab="customize"
            />
          </div>
        }
        preview={{
          title,
          description,
          fields,
          logoData: logoData ?? undefined,
          customization,
          formLayout,
          submitLabel: 'Submit Feedback',
        }}
        topBarExtra={
          <Button type="button" variant="secondary" size="sm" onClick={() => setShowAIModal(true)}>
            ✨ Create with AI
          </Button>
        }
      />
    </>
  );
}

export default function CreateFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <CreateFormPageInner />
    </Suspense>
  );
}

