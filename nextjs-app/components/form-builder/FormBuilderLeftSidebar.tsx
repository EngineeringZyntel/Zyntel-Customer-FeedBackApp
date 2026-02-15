/**
 * Form Builder Left Sidebar
 * Contains templates, form layout options, and all field/layout types with previews (Tally-style)
 */

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface FieldType {
  id: string
  label: string
  type: string
  icon: string
  category: 'input' | 'choice' | 'rating' | 'layout'
  preview: string
}

export type FormLayoutOption = 'centered' | 'fullWidth'

export interface FormLayoutChoice {
  id: FormLayoutOption
  label: string
  description: string
  icon: string
}

export const FORM_LAYOUT_OPTIONS: FormLayoutChoice[] = [
  { id: 'centered', label: 'Centered card', description: 'Form in a centered card with max width', icon: '▢' },
  { id: 'fullWidth', label: 'Full width', description: 'Form stretches to full container width', icon: '▭' },
]

export const FIELD_TYPES: FieldType[] = [
  // Input Fields
  { id: 'text', label: 'Short Text', type: 'text', icon: '📝', category: 'input', preview: 'Single line text input' },
  { id: 'textarea', label: 'Long Text', type: 'textarea', icon: '📄', category: 'input', preview: 'Multiple line text area' },
  { id: 'email', label: 'Email', type: 'email', icon: '📧', category: 'input', preview: 'Email address input' },
  { id: 'number', label: 'Number', type: 'number', icon: '🔢', category: 'input', preview: 'Numeric input' },
  { id: 'tel', label: 'Phone', type: 'tel', icon: '📱', category: 'input', preview: 'Phone number input' },
  { id: 'date', label: 'Date', type: 'date', icon: '📅', category: 'input', preview: 'Date picker' },
  { id: 'time', label: 'Time', type: 'time', icon: '🕐', category: 'input', preview: 'Time picker' },
  { id: 'link', label: 'URL', type: 'link', icon: '🔗', category: 'input', preview: 'Website URL input' },
  
  // Choice Fields
  { id: 'multiple', label: 'Multiple Choice', type: 'multiple', icon: '◉', category: 'choice', preview: 'Radio buttons - single selection' },
  { id: 'checkbox', label: 'Checkboxes', type: 'checkbox', icon: '☑', category: 'choice', preview: 'Multiple selections allowed' },
  { id: 'select', label: 'Dropdown', type: 'select', icon: '▼', category: 'choice', preview: 'Dropdown menu selection' },
  
  // Rating Fields
  { id: 'rating', label: 'Star Rating', type: 'rating', icon: '⭐', category: 'rating', preview: 'Star rating (1-5 or 1-10)' },
  { id: 'linearScale', label: 'Linear Scale', type: 'linearScale', icon: '📊', category: 'rating', preview: 'Numbered scale with labels' },
  
  // Layout Elements
  { id: 'heading1', label: 'Heading 1', type: 'heading1', icon: 'H1', category: 'layout', preview: 'Large section heading' },
  { id: 'heading2', label: 'Heading 2', type: 'heading2', icon: 'H2', category: 'layout', preview: 'Medium section heading' },
  { id: 'heading3', label: 'Heading 3', type: 'heading3', icon: 'H3', category: 'layout', preview: 'Small section heading' },
  { id: 'title', label: 'Title', type: 'title', icon: '📌', category: 'layout', preview: 'Bold section title' },
  { id: 'paragraph', label: 'Text Block', type: 'paragraph', icon: '¶', category: 'layout', preview: 'Paragraph with instructions' },
  { id: 'label', label: 'Label', type: 'label', icon: '🏷', category: 'layout', preview: 'Small descriptive label' },
  { id: 'divider', label: 'Divider', type: 'divider', icon: '─', category: 'layout', preview: 'Horizontal line separator' },
]

export interface FormTemplate {
  name: string
  title: string
  description: string
  industry?: string
  fields: { label: string; type: string; options?: string[]; maxRating?: number }[]
}

interface FormBuilderLeftSidebarProps {
  onAddField: (fieldType: FieldType) => void
  templates?: FormTemplate[]
  onApplyTemplate?: (template: FormTemplate) => void
  formLayout?: FormLayoutOption
  onFormLayoutChange?: (layout: FormLayoutOption) => void
  /** Form settings: thank you message, redirect, close date, response limit - rendered in sidebar */
  formSettings?: {
    thankYouMessage: string
    thankYouRedirectUrl: string
    closeDate: string
    responseLimit: number | ''
    onThankYouMessageChange: (v: string) => void
    onThankYouRedirectUrlChange: (v: string) => void
    onCloseDateChange: (v: string) => void
    onResponseLimitChange: (v: number | '') => void
  }
}

export function FormBuilderLeftSidebar({
  onAddField,
  templates,
  onApplyTemplate,
  formLayout = 'centered',
  onFormLayoutChange,
  formSettings,
}: FormBuilderLeftSidebarProps) {
  const [activeCategory, setActiveCategory] = useState<string>('input')
  const [hoveredField, setHoveredField] = useState<string | null>(null)
  const [hoveredLayout, setHoveredLayout] = useState<FormLayoutOption | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const categories = [
    { id: 'input', label: 'Input', icon: '✏️' },
    { id: 'choice', label: 'Choice', icon: '◉' },
    { id: 'rating', label: 'Rating', icon: '⭐' },
    { id: 'layout', label: 'Layout', icon: '📐' },
  ]

  const filteredFields = FIELD_TYPES.filter(f => f.category === activeCategory)

  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Form builder</h2>
        <p className="text-xs text-gray-500 mt-1">Add fields &amp; options from here</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Form layout options with preview */}
        {onFormLayoutChange && (
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Form layout</h3>
            <div className="space-y-1">
              {FORM_LAYOUT_OPTIONS.map((opt) => (
                <div key={opt.id} className="relative">
                  <button
                    type="button"
                    onClick={() => onFormLayoutChange(opt.id)}
                    onMouseEnter={() => setHoveredLayout(opt.id)}
                    onMouseLeave={() => setHoveredLayout(null)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-all border',
                      formLayout === opt.id
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{opt.icon}</span>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.description}</div>
                      </div>
                    </div>
                  </button>
                  {hoveredLayout === opt.id && (
                    <div className="absolute left-full ml-2 top-0 z-50 w-56 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-2">LAYOUT PREVIEW</div>
                      <LayoutOptionPreview layout={opt.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates */}
        {templates && templates.length > 0 && onApplyTemplate && (
          <div className="p-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Start from template</h3>
            <div className="flex flex-wrap gap-1.5">
              {templates.slice(0, 6).map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => onApplyTemplate(t)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex-1 px-2 py-2.5 text-sm font-medium transition-colors relative',
                activeCategory === cat.id
                  ? 'text-primary bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <span className="mr-0.5">{cat.icon}</span>
              {cat.label}
              {activeCategory === cat.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Field List with previews */}
        <div className="p-2">
        <div className="space-y-1">
          {filteredFields.map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => onAddField(field)}
              onMouseEnter={() => setHoveredField(field.id)}
              onMouseLeave={() => setHoveredField(null)}
              className={cn(
                'w-full p-3 rounded-lg text-left transition-all',
                'border border-transparent hover:border-primary hover:bg-blue-50',
                'group relative'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{field.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 group-hover:text-primary">
                    {field.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {field.preview}
                  </div>
                </div>
              </div>

              {/* Hover Preview - before selecting */}
                {hoveredField === field.id && (
                  <div className="absolute left-full ml-2 top-0 z-50 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200">
                    <div className="text-xs font-medium text-gray-500 mb-2">PREVIEW</div>
                    <FieldPreview field={field} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form settings */}
        {formSettings && (
          <div className="p-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span>Form settings</span>
              <span className="text-gray-400">{settingsOpen ? '▼' : '▶'}</span>
            </button>
            {settingsOpen && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Thank-you message</label>
                  <textarea
                    value={formSettings.thankYouMessage}
                    onChange={(e) => formSettings.onThankYouMessageChange(e.target.value)}
                    placeholder="Thanks for your feedback!"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Redirect URL (optional)</label>
                  <input
                    type="url"
                    value={formSettings.thankYouRedirectUrl}
                    onChange={(e) => formSettings.onThankYouRedirectUrlChange(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Close date (optional)</label>
                  <input
                    type="datetime-local"
                    value={formSettings.closeDate}
                    onChange={(e) => formSettings.onCloseDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Response limit (optional)</label>
                  <input
                    type="number"
                    min={1}
                    value={formSettings.responseLimit === '' ? '' : formSettings.responseLimit}
                    onChange={(e) =>
                      formSettings.onResponseLimitChange(
                        e.target.value === '' ? '' : parseInt(e.target.value, 10)
                      )
                    }
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Tip */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 shrink-0">
        <div className="text-xs text-gray-600">
          💡 Hover any option to see a preview before adding
        </div>
      </div>
    </aside>
  )
}

/** Mini preview for form layout option */
function LayoutOptionPreview({ layout }: { layout: FormLayoutOption }) {
  if (layout === 'centered') {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-2">
        <div className="mx-auto w-3/4 rounded bg-white border border-gray-200 shadow-sm h-16 flex items-center justify-center text-xs text-gray-400">
          Form card
        </div>
      </div>
    )
  }
  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-2">
      <div className="w-full rounded bg-white border border-gray-200 shadow-sm h-12 flex items-center justify-center text-xs text-gray-400">
        Full width form
      </div>
    </div>
  )
}

/**
 * Field Preview Component
 */
function FieldPreview({ field }: { field: FieldType }) {
  // Layout previews
  if (field.type === 'divider') {
    return <hr className="border-t-2 border-gray-300 my-2" />
  }
  
  if (field.type === 'heading1') {
    return <h2 className="text-2xl font-bold text-gray-900">Heading 1</h2>
  }
  
  if (field.type === 'heading2') {
    return <h3 className="text-xl font-semibold text-gray-900">Heading 2</h3>
  }
  
  if (field.type === 'heading3') {
    return <h4 className="text-lg font-medium text-gray-900">Heading 3</h4>
  }
  
  if (field.type === 'title') {
    return <h4 className="text-lg font-bold text-gray-900">Section Title</h4>
  }
  
  if (field.type === 'paragraph') {
    return (
      <p className="text-sm text-gray-600 leading-relaxed">
        This is a text block. Use it to add instructions, context, or information to your form.
      </p>
    )
  }
  
  if (field.type === 'label') {
    return <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">LABEL TEXT</p>
  }

  // Input previews
  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
        <textarea 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
          rows={3}
          placeholder="Your answer..."
          disabled
        />
      </div>
    )
  }

  // Choice previews
  if (field.type === 'multiple') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" className="w-4 h-4" disabled />
            <span className="text-sm">Option 1</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" className="w-4 h-4" disabled />
            <span className="text-sm">Option 2</span>
          </label>
        </div>
      </div>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" disabled />
            <span className="text-sm">Option 1</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" disabled />
            <span className="text-sm">Option 2</span>
          </label>
        </div>
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" disabled>
          <option>Select an option...</option>
        </select>
      </div>
    )
  }

  // Rating previews
  if (field.type === 'rating') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-2xl text-yellow-400">★</span>
          ))}
        </div>
      </div>
    )
  }

  if (field.type === 'linearScale') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Not at all</span>
          <span>Extremely</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg text-sm font-medium">
              {i}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default input preview
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
      <input 
        type={field.type}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        placeholder="Your answer..."
        disabled
      />
    </div>
  )
}
