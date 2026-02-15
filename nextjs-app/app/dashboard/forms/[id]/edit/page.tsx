/**
 * Edit Form Page
 *
 * Edit an existing form using the same builder as create
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { InsertBlockModal, type BlockType } from '@/components/form-builder/InsertBlockModal'
import { LayoutToolbar, type LayoutBlock } from '@/components/form-builder/LayoutToolbar'
import { FormCustomizationSidebar, type FormCustomization } from '@/components/form-builder/FormCustomizationSidebar'
import type { FormHeaderConfig } from '@/components/form-builder/FormHeaderSection'
import { formsApi } from '@/lib/api'
import { getCurrentUser } from '@/lib/jwt'

interface FormField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
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
  const [showInsertModal, setShowInsertModal] = useState(false)
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null)
  const [customization, setCustomization] = useState<FormCustomization>({})
  const [logoData, setLogoData] = useState<string | null>(null)

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

  const insertLayoutBlock = (block: LayoutBlock, atIndex?: number) => {
    const idx = atIndex ?? insertAtIndex ?? fields.length
    const next = [...fields]
    next.splice(idx, 0, { label: block.label, type: block.type } as FormField)
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
    } catch (err: any) {
      setError(err.message || 'Failed to load form')
    } finally {
      setIsLoading(false)
    }
  }

  const insertBlockAt = (block: BlockType, atIndex?: number) => {
    const defaults: Record<string, FormField> = {
      text: { label: '', type: 'text' },
      textarea: { label: '', type: 'textarea' },
      email: { label: 'Email', type: 'email' },
      number: { label: '', type: 'number' },
      tel: { label: 'Phone number', type: 'tel' },
      date: { label: 'Date', type: 'date' },
      time: { label: 'Time', type: 'time' },
      link: { label: 'Website URL', type: 'link' },
      select: { label: '', type: 'select', options: ['', ''] },
      multiple: { label: '', type: 'multiple', options: ['', '', ''] },
      checkbox: { label: '', type: 'checkbox', options: ['', ''] },
      rating: { label: '', type: 'rating', maxRating: 5 },
      linearScale: { label: '', type: 'linearScale', maxRating: 5 },
    }
    const def = defaults[block.type] ?? { label: '', type: 'text' }
    const idx = atIndex ?? fields.length
    const next = [...fields]
    next.splice(idx, 0, { ...def })
    setFields(next)
  }

  const insertBlock = (block: BlockType) => {
    insertBlockAt(block, insertAtIndex ?? undefined)
    setInsertAtIndex(null)
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], ...updates }
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="flex">
        <main className="min-h-screen flex-1 overflow-auto py-8 px-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Edit Form</h1>
            <Link href={`/dashboard/forms/${formId}`}>
              <Button type="button" variant="ghost">Back to form</Button>
            </Link>
          </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Form settings</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <p className="text-sm text-text-secondary mb-4">
              Header (logo, title, subtext) and styling are in the sidebar →
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Thank-you message (optional)</label>
                <textarea
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                  placeholder="e.g., Thanks for your feedback!"
                />
              </div>
              <Input
                label="Redirect URL after submit (optional)"
                type="url"
                value={thankYouRedirectUrl}
                onChange={(e) => setThankYouRedirectUrl(e.target.value)}
                placeholder="https://..."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Close date (optional)</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Response limit (optional)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={responseLimit}
                    onChange={(e) => setResponseLimit(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g., 100"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <div className="mb-4">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <h2 className="text-xl font-semibold">Form content</h2>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setInsertAtIndex(null); setShowInsertModal(true) }}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">+</span>
                  Add question
                </Button>
              </div>
              <LayoutToolbar onInsert={(b) => insertLayoutBlock(b, insertAtIndex ?? undefined)} />
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  {index > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-2">
                      <button
                        type="button"
                        onClick={() => { setInsertAtIndex(index); setShowInsertModal(true) }}
                        className="flex flex-1 items-center justify-center gap-2 py-2 text-sm text-gray-500 transition hover:text-primary"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold shadow-sm">+</span>
                        Add question
                      </button>
                      <LayoutToolbar onInsert={(b) => insertLayoutBlock(b, index)} className="flex-1" />
                    </div>
                  )}
                  <div className="border border-border rounded-lg p-4 bg-bg-secondary">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <Input
                        label="Field Label"
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="e.g., Your Name"
                      />
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Field Type</label>
                        <select
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value })}
                        >
                          <optgroup label="Questions">
                            <option value="text">Short answer</option>
                            <option value="textarea">Long answer</option>
                            <option value="multiple">Multiple choice</option>
                            <option value="checkbox">Checkboxes</option>
                            <option value="select">Dropdown</option>
                            <option value="number">Number</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone number</option>
                            <option value="link">Link</option>
                            <option value="date">Date</option>
                            <option value="time">Time</option>
                            <option value="linearScale">Linear scale</option>
                            <option value="rating">Rating</option>
                          </optgroup>
                          <optgroup label="Layout">
                            <option value="paragraph">Text</option>
                            <option value="heading1">Heading 1</option>
                            <option value="heading2">Heading 2</option>
                            <option value="heading3">Heading 3</option>
                            <option value="divider">Divider</option>
                            <option value="title">Title</option>
                            <option value="label">Label</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {(field.type === 'select' || field.type === 'multiple' || field.type === 'checkbox') && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-text-primary mb-2">Options</label>
                        <div className="space-y-2">
                          {field.options?.map((option, optIdx) => (
                            <div key={optIdx} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(index, optIdx, e.target.value)}
                                placeholder={`Option ${optIdx + 1}`}
                              />
                              <Button type="button" variant="danger" size="sm" onClick={() => removeOption(index, optIdx)}>Remove</Button>
                            </div>
                          ))}
                          <Button type="button" variant="ghost" size="sm" onClick={() => addOption(index)}>+ Add Option</Button>
                        </div>
                      </div>
                    )}

                    {(field.type === 'rating' || field.type === 'linearScale') && (
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Max scale</label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={field.maxRating || 5}
                          onChange={(e) => updateField(index, { maxRating: parseInt(e.target.value) || 5 })}
                        />
                      </div>
                    )}

                    <Button type="button" variant="danger" size="sm" onClick={() => removeField(index)} className="mt-4">
                      Remove Field
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {fields.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 py-12">
                <LayoutToolbar onInsert={(b) => insertLayoutBlock(b)} />
                <button
                  type="button"
                  onClick={() => { setInsertAtIndex(null); setShowInsertModal(true) }}
                  className="flex flex-col items-center gap-2 text-gray-500 transition hover:text-primary"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">+</span>
                  <span className="font-medium">Add first question</span>
                </button>
              </div>
            )}
          </Card>

          <InsertBlockModal
            isOpen={showInsertModal}
            onClose={() => { setShowInsertModal(false); setInsertAtIndex(null) }}
            onInsert={insertBlock}
          />

          <div className="flex gap-4">
            <Link href={`/dashboard/forms/${formId}`}>
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
        </main>

        <FormCustomizationSidebar
          headerConfig={headerConfig}
          customization={customization}
          onHeaderChange={onHeaderChange}
          onCustomizationChange={setCustomization}
        />
      </div>
    </div>
  )
}
