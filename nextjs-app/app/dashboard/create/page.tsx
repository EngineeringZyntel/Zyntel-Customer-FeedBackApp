/**
 * Create Form Page
 * Tally-style form builder: left sidebar (fields + layout + settings), center canvas, right sidebar (customize).
 * Preview (view only) and Publish (save) buttons in top bar.
 */

'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import {
  FormBuilderLeftSidebar,
  type FieldType as SidebarFieldType,
  type FormTemplate,
  type FormLayoutOption,
} from '@/components/form-builder/FormBuilderLeftSidebar'
import {
  FormBuilderRightSidebar,
  type FormCustomization,
} from '@/components/form-builder/FormBuilderRightSidebar'
import type { FormHeaderConfig } from '@/components/form-builder/FormHeaderSection'
import { FormPreviewModal } from '@/components/form-builder/FormPreviewModal'
import { formsApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface FormField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
  scaleLabels?: { min: string; max: string }
}

const TEMPLATES: FormTemplate[] = [
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
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null)
  const [customization, setCustomization] = useState<FormCustomization>({})
  const [logoData, setLogoData] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [formLayout, setFormLayout] = useState<FormLayoutOption>('centered')

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

  return (
    <div className="min-h-screen bg-bg-secondary flex flex-col">
      {/* Top bar: title + Preview (view only) + Publish (save) */}
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Create New Form</h1>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={(e) => {
              e.preventDefault()
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
            }}
            isLoading={isSubmitting}
          >
            Publish
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: fields, layout options, templates, form settings */}
        <FormBuilderLeftSidebar
          onAddField={handleAddFieldFromSidebar}
          templates={TEMPLATES}
          onApplyTemplate={applyTemplate}
          formLayout={formLayout}
          onFormLayoutChange={setFormLayout}
          formSettings={{
            thankYouMessage,
            thankYouRedirectUrl,
            closeDate,
            responseLimit,
            onThankYouMessageChange: setThankYouMessage,
            onThankYouRedirectUrlChange: setThankYouRedirectUrl,
            onCloseDateChange: setCloseDate,
            onResponseLimitChange: setResponseLimit,
          }}
        />

        {/* Main canvas: form content only */}
        <main className="flex-1 overflow-y-auto py-6 px-6">
          <form id="create-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {fields.map((field, index) => {
                const isLayoutBlock = ['paragraph', 'heading1', 'heading2', 'heading3', 'divider', 'title', 'label'].includes(field.type)
                
                return (
                <div key={index} className="space-y-2">
                  {index > 0 && (
                    <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 py-2">
                      <button
                        type="button"
                        onClick={() => setInsertAtIndex(index)}
                        className={cn(
                          'flex items-center gap-2 py-2 px-4 text-sm text-gray-500 transition hover:text-primary',
                          insertAtIndex === index && 'text-primary font-medium'
                        )}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold shadow-sm">+</span>
                        {insertAtIndex === index ? 'Click a field on the left to add here' : 'Add field here'}
                      </button>
                    </div>
                  )}
                  <div className="border border-border rounded-lg p-4 bg-bg-secondary">
                  
                  {/* Layout blocks have different UI - just show preview */}
                  {isLayoutBlock ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {field.type === 'divider' ? '⎯ Divider' :
                           field.type === 'heading1' ? 'H1 Heading' :
                           field.type === 'heading2' ? 'H2 Heading' :
                           field.type === 'heading3' ? 'H3 Heading' :
                           field.type === 'paragraph' ? '¶ Text Block' :
                           field.type === 'title' ? '📌 Title' :
                           field.type === 'label' ? '🏷 Label' : field.type}
                        </span>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeField(index)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      {field.type === 'divider' ? (
                        <div className="py-4">
                          <hr className="border-t-2 border-gray-300" />
                          <p className="text-xs text-gray-400 text-center mt-2">This will appear as a divider line</p>
                        </div>
                      ) : (
                        <>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            {field.type === 'paragraph' ? 'Text content' : 
                             field.type === 'title' ? 'Section title' :
                             field.type === 'label' ? 'Label text' : 'Heading text'}
                          </label>
                          <textarea
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={field.type === 'paragraph' ? 3 : 1}
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                            placeholder={
                              field.type === 'paragraph' ? 'Enter descriptive text or instructions...' :
                              field.type === 'heading1' ? 'Major Section' :
                              field.type === 'heading2' ? 'Subsection' :
                              field.type === 'heading3' ? 'Minor Heading' :
                              field.type === 'title' ? 'Section Title' :
                              'Label Text'
                            }
                          />
                        </>
                      )}
                    </div>
                  ) : (
                    <>
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
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">
                          {field.type === 'rating' ? 'Max Rating (Stars)' : 'Max Scale (1 to X)'}
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={field.maxRating || 5}
                          onChange={(e) => updateField(index, { maxRating: parseInt(e.target.value) || 5 })}
                        />
                      </div>
                      
                      {field.type === 'linearScale' && (
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Scale Labels (optional)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Min label (e.g., Not at all)"
                              value={field.scaleLabels?.min || ''}
                              onChange={(e) => updateField(index, { 
                                scaleLabels: { min: e.target.value, max: field.scaleLabels?.max || '' }
                              })}
                            />
                            <Input
                              placeholder="Max label (e.g., Extremely)"
                              value={field.scaleLabels?.max || ''}
                              onChange={(e) => updateField(index, { 
                                scaleLabels: { min: field.scaleLabels?.min || '', max: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      )}
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
                  </>
                  )}
                </div>
              </div>
            );
          })}
            </div>

            {fields.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 py-16">
                <p className="text-sm text-gray-500">No fields yet. Add fields from the left sidebar.</p>
                <p className="text-xs text-gray-400">Choose Input, Choice, Rating, or Layout and click to add.</p>
              </div>
            )}
        </form>
        </main>

        {/* Right sidebar: Header + Rest of form customization */}
        <FormBuilderRightSidebar
          headerConfig={headerConfig}
          customization={customization}
          onHeaderChange={onHeaderChange}
          onCustomizationChange={setCustomization}
        />
      </div>

      <FormPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        description={description}
        fields={fields}
        logoData={logoData ?? undefined}
        customization={customization}
        formLayout={formLayout}
      />
    </div>
  );
}

