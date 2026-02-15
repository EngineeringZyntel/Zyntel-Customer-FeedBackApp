/**
 * Create Form Page
 * 
 * Form builder interface for creating new forms
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { InsertBlockModal, type BlockType } from '@/components/form-builder/InsertBlockModal'
import { LayoutToolbar, type LayoutBlock } from '@/components/form-builder/LayoutToolbar'
import { FormCustomizationSidebar, type FormCustomization } from '@/components/form-builder/FormCustomizationSidebar'
import type { FormHeaderConfig } from '@/components/form-builder/FormHeaderSection'
import { formsApi } from '@/lib/api'

interface FormField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
}

const TEMPLATES: { name: string; title: string; description: string; fields: FormField[]; industry?: string }[] = [
  {
    name: 'Event feedback',
    title: 'Event Feedback',
    description: 'Help us improve future events. Your feedback is valuable.',
    industry: 'Events',
    fields: [
      { label: 'How would you rate the event?', type: 'rating', maxRating: 5 },
      { label: 'What did you enjoy most?', type: 'textarea' },
      { label: 'What could we improve?', type: 'textarea' },
      { label: 'Would you attend again?', type: 'select', options: ['Yes', 'No', 'Maybe'] },
    ],
  },
  {
    name: 'NPS',
    title: 'Net Promoter Score',
    description: 'How likely are you to recommend us to a friend or colleague?',
    fields: [
      { label: 'On a scale of 0–10, how likely are you to recommend us?', type: 'rating', maxRating: 10 },
      { label: 'What is the main reason for your score?', type: 'textarea' },
    ],
  },
  {
    name: 'Contact',
    title: 'Contact Us',
    description: 'Send us a message and we\'ll get back to you.',
    fields: [
      { label: 'Your name', type: 'text' },
      { label: 'Email', type: 'email' },
      { label: 'Subject', type: 'select', options: ['General inquiry', 'Support', 'Feedback', 'Other'] },
      { label: 'Message', type: 'textarea' },
    ],
  },
  {
    name: 'Patient satisfaction',
    title: 'Patient Satisfaction Survey',
    description: 'Your feedback helps us improve our healthcare services.',
    industry: 'Healthcare',
    fields: [
      { label: 'How would you rate your overall experience?', type: 'rating', maxRating: 5 },
      { label: 'How satisfied were you with the wait time?', type: 'rating', maxRating: 5 },
      { label: 'How would you rate the staff professionalism?', type: 'rating', maxRating: 5 },
      { label: 'Was your concern adequately addressed?', type: 'select', options: ['Yes', 'No', 'Partially'] },
      { label: 'Additional comments or suggestions', type: 'textarea' },
    ],
  },
  {
    name: 'Appointment booking',
    title: 'Appointment Request',
    description: 'Request an appointment with our healthcare team.',
    industry: 'Healthcare',
    fields: [
      { label: 'Full name', type: 'text' },
      { label: 'Phone number', type: 'tel' },
      { label: 'Email', type: 'email' },
      { label: 'Preferred date', type: 'date' },
      { label: 'Type of appointment', type: 'select', options: ['Consultation', 'Follow-up', 'Routine checkup', 'Emergency'] },
      { label: 'Reason for visit', type: 'textarea' },
    ],
  },
  {
    name: 'Medical survey',
    title: 'Patient Health Survey',
    description: 'Help us understand your health needs better.',
    industry: 'Healthcare',
    fields: [
      { label: 'Age range', type: 'select', options: ['Under 18', '18-30', '31-50', '51-70', 'Over 70'] },
      { label: 'Do you have any chronic conditions?', type: 'checkbox', options: ['Diabetes', 'Hypertension', 'Asthma', 'Heart disease', 'None'] },
      { label: 'Are you currently taking any medications?', type: 'select', options: ['Yes', 'No'] },
      { label: 'Please list your medications (if applicable)', type: 'textarea' },
      { label: 'Do you have any allergies?', type: 'textarea' },
    ],
  },
  {
    name: 'Event registration',
    title: 'Event Registration',
    description: 'Register for our upcoming event.',
    industry: 'Events',
    fields: [
      { label: 'Full name', type: 'text' },
      { label: 'Email', type: 'email' },
      { label: 'Phone number', type: 'tel' },
      { label: 'Organization', type: 'text' },
      { label: 'Ticket type', type: 'select', options: ['General admission', 'VIP', 'Student', 'Group'] },
      { label: 'Dietary requirements', type: 'checkbox', options: ['Vegetarian', 'Vegan', 'Gluten-free', 'None'] },
      { label: 'How did you hear about this event?', type: 'select', options: ['Social media', 'Email', 'Friend', 'Website', 'Other'] },
    ],
  },
  {
    name: 'Post-event survey',
    title: 'Post-Event Survey',
    description: 'Thank you for attending! Please share your thoughts.',
    industry: 'Events',
    fields: [
      { label: 'Overall event rating', type: 'rating', maxRating: 5 },
      { label: 'How would you rate the venue?', type: 'rating', maxRating: 5 },
      { label: 'How would you rate the content/speakers?', type: 'rating', maxRating: 5 },
      { label: 'Was the event well-organized?', type: 'select', options: ['Excellent', 'Good', 'Average', 'Poor'] },
      { label: 'What did you like most?', type: 'textarea' },
      { label: 'What could be improved?', type: 'textarea' },
      { label: 'Would you attend future events?', type: 'select', options: ['Definitely', 'Probably', 'Maybe', 'No'] },
    ],
  },
  {
    name: 'Vendor application',
    title: 'Event Vendor Application',
    description: 'Apply to be a vendor at our event.',
    industry: 'Events',
    fields: [
      { label: 'Business name', type: 'text' },
      { label: 'Contact person', type: 'text' },
      { label: 'Email', type: 'email' },
      { label: 'Phone', type: 'tel' },
      { label: 'Type of products/services', type: 'textarea' },
      { label: 'Booth size needed', type: 'select', options: ['Small (10x10)', 'Medium (10x20)', 'Large (20x20)'] },
      { label: 'Have you been a vendor before?', type: 'select', options: ['Yes', 'No'] },
    ],
  },
]

export default function CreateFormPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [thankYouMessage, setThankYouMessage] = useState('')
  const [thankYouRedirectUrl, setThankYouRedirectUrl] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [responseLimit, setResponseLimit] = useState<number | ''>('')
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

  const applyTemplate = (t: (typeof TEMPLATES)[0]) => {
    setTitle(t.title)
    setDescription(t.description)
    setFields(t.fields.map((f) => ({ ...f, options: f.options ? [...f.options] : undefined })))
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

  const addField = () => {
    setFields([...fields, { label: '', type: 'text' }])
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="flex">
        <main className="min-h-screen flex-1 overflow-auto py-8 px-6">
          <h1 className="text-3xl font-bold mb-6">Create New Form</h1>

        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Start from a template</h2>
          <p className="text-sm text-text-secondary mb-4">Pre-built forms you can customize for your needs.</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">Healthcare</h3>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.filter(t => t.industry === 'Healthcare').map((t) => (
                  <Button
                    key={t.name}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => applyTemplate(t)}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">Events</h3>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.filter(t => t.industry === 'Events').map((t) => (
                  <Button
                    key={t.name}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => applyTemplate(t)}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-2">General</h3>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.filter(t => !t.industry).map((t) => (
                  <Button
                    key={t.name}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => applyTemplate(t)}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

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
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Thank-you message (optional)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                  placeholder="e.g., Thanks for your feedback! We'll be in touch."
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
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Close date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Response limit (optional)
                  </label>
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
                      required
                      placeholder="e.g., Your Name"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Field Type
                      </label>
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

                  {(field.type === 'select' || field.type === 'multiple' || field.type === 'checkbox') && !['paragraph', 'heading1', 'heading2', 'heading3', 'divider', 'title', 'label'].includes(field.type) && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {field.options?.map((option, optIdx) => (
                          <div key={optIdx} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                            />
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeOption(index, optIdx)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addOption(index)}
                        >
                          + Add Option
                        </Button>
                      </div>
                    </div>
                  )}

                  {(field.type === 'rating' || field.type === 'linearScale') && (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Max Rating
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={field.maxRating || 5}
                        onChange={(e) => updateField(index, { maxRating: parseInt(e.target.value) || 5 })}
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
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
            onClose={() => {
              setShowInsertModal(false)
              setInsertAtIndex(null)
            }}
            onInsert={insertBlock}
          />

          <div className="flex gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Form
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

