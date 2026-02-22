/**
 * Edit Form Page
 * Same Tally-style builder as create: left sidebar (fields + layout + settings),
 * center canvas, right sidebar (customize). Preview and Publish (Save) in top bar.
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import {
  type FieldType as SidebarFieldType,
  type FormLayoutOption,
} from '@/components/form-builder/FormBuilderLeftSidebar'
import {
  FormBuilderRightSidebar,
  type FormCustomization,
} from '@/components/form-builder/FormBuilderRightSidebar'
import type { FormHeaderConfig } from '@/components/form-builder/FormHeaderSection'
import { FormBuilderOpnFormLayout } from '@/components/form-builder/FormBuilderOpnFormLayout'
import { FormStructureSection } from '@/components/form-builder/FormStructureSection'
import { TemplatesPanel } from '@/components/form-builder/TemplatesPanel'
import { formsApi } from '@/lib/api'
import { FORM_TEMPLATES } from '@/lib/form-templates'
import { getCurrentUser } from '@/lib/jwt'
import { formatRelativeTime } from '@/lib/utils'

interface FormField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
  scaleLabels?: { min: string; max: string }
}

export default function EditFormPage() {
  const params = useParams()
  const router = useRouter()
  const formId = parseInt(params.id as string)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [thankYouMessage, setThankYouMessage] = useState('')
  const [thankYouRedirectUrl, setThankYouRedirectUrl] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [responseLimit, setResponseLimit] = useState<number | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null)
  const [customization, setCustomization] = useState<FormCustomization>({})
  const [logoData, setLogoData] = useState<string | null>(null)
  const [formLayout, setFormLayout] = useState<FormLayoutOption>('centered')
  const [editedAt, setEditedAt] = useState<string>('')
  const [copySettingsOpen, setCopySettingsOpen] = useState(false)

  const headerConfig: FormHeaderConfig = {
    logoData: logoData ?? undefined,
    headerTitle: title,
    headerSubtext: description ?? undefined,
    headerBackgroundColor: customization.headerBackgroundColor,
  }

  const onHeaderChange = (config: FormHeaderConfig) => {
    setTitle(config.headerTitle)
    setDescription(config.headerSubtext ?? '')
    setLogoData(config.logoData ?? null)
    if (config.headerBackgroundColor !== undefined) {
      setCustomization((c) => ({ ...c, headerBackgroundColor: config.headerBackgroundColor }))
    }
  }

  const applyTemplate = (t: (typeof FORM_TEMPLATES)[number]) => {
    setTitle(t.title)
    setDescription(t.description)
    setFields(t.fields.map((f) => ({ ...f, options: f.options ? [...f.options] : undefined })))
  }

  /** Add a field from the left sidebar; inserts at insertAtIndex or end */
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

  useEffect(() => {
    loadForm()
  }, [formId])

  const loadForm = async () => {
    try {
      setIsLoading(true)
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }
      const data = (await formsApi.getById(formId)) as { form: any }
      const f = data.form
      setTitle(f.title || '')
      setDescription(f.description || '')
      setLogoData(f.logoData ?? null)
      setCustomization((f.customization as FormCustomization) || {})
      setFields((f.fields as FormField[]) || [])
      setThankYouMessage(f.thankYouMessage || '')
      setThankYouRedirectUrl(f.thankYouRedirectUrl || '')
      setCloseDate(f.closeDate ? new Date(f.closeDate).toISOString().slice(0, 16) : '')
      setResponseLimit(f.responseLimit ?? '')
      setEditedAt(f.updatedAt ? `Edited ${formatRelativeTime(f.updatedAt)}` : '')
    } catch (err: any) {
      setError(err.message || 'Failed to load form')
    } finally {
      setIsLoading(false)
    }
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
    if (!updated[fieldIndex].options) updated[fieldIndex].options = []
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

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
      await formsApi.update(formId, {
        title,
        description,
        logoData: logoData ?? undefined,
        customization: Object.keys(customization).length ? customization : undefined,
        fields: fields.map((f) => ({
          label: f.label || '',
          type: f.type,
          options: f.options?.filter((opt) => opt?.trim()),
          maxRating: f.maxRating ?? 5,
        })),
        thankYouMessage: thankYouMessage.trim() || undefined,
        thankYouRedirectUrl: thankYouRedirectUrl.trim() || undefined,
        closeDate: closeDate ? new Date(closeDate).toISOString() : undefined,
        responseLimit: responseLimit === '' ? undefined : Number(responseLimit),
      })
      router.push(`/dashboard/forms/${formId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to update form')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-text-secondary">Loading form...</div>
      </div>
    )
  }

  const saveForm = () => {
    handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent<HTMLFormElement>)
  }

  return (
    <FormBuilderOpnFormLayout
      backHref={`/dashboard/forms/${formId}`}
      formTitle={title || 'Untitled form'}
      editedAt={editedAt}
      onSave={saveForm}
      isSaving={isSubmitting}
      templatesSection={<TemplatesPanel templates={FORM_TEMPLATES} onSelect={applyTemplate} />}
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
              placeholder="Describe your form..."
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-600"
            onClick={() => setCopySettingsOpen(!copySettingsOpen)}
          >
            <span className="mr-2">📋</span>
            Copy another form&apos;s settings
          </Button>
          {copySettingsOpen && (
            <p className="text-xs text-slate-500">Open a form to copy from the dashboard, then edit it here.</p>
          )}
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
    />
  )
}
