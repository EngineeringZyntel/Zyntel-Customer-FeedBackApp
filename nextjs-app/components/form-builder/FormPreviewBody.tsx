/**
 * Shared form preview body – used by FormPreviewModal and InlineFormPreview
 */

'use client'

import { Button } from '@/components/ui/Button'

export interface FormPreviewField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
  scaleLabels?: { min: string; max: string }
}

interface FormPreviewBodyProps {
  title: string
  description?: string
  fields: FormPreviewField[]
  logoData?: string
  customization: Record<string, any>
  formLayout?: 'centered' | 'fullWidth'
  submitLabel?: string
}

export function FormPreviewBody({
  title,
  description,
  fields,
  logoData,
  customization,
  formLayout = 'centered',
  submitLabel = 'Submit',
}: FormPreviewBodyProps) {
  const bgColor = customization.backgroundColor || '#f7f9fc'
  const primaryColor = customization.primaryColor || '#0066FF'
  const headerBg = customization.headerBackgroundColor || '#f7f9fc'
  const headerTextColor = customization.headerTextColor || customization.textColor || '#0F1419'
  const fontFamily = customization.fontFamily || undefined
  const headerFontSize = customization.headerFontSize || '1.5rem'
  const bodyFontSize = customization.bodyFontSize || '1rem'
  const textColor = customization.textColor || '#0F1419'
  const borderRadius = customization.borderRadius || '0.5rem'
  const formBg = customization.formBackgroundColor || '#ffffff'
  const borderColor = customization.fieldBorderColor || '#D1D5DB'

  return (
    <div
      className="min-h-full py-8 px-4"
      style={{
        backgroundColor: bgColor,
        fontFamily,
        fontSize: bodyFontSize,
        color: textColor,
      }}
    >
      <div className={formLayout === 'fullWidth' ? 'w-full' : 'max-w-2xl mx-auto'}>
        <div
          className="overflow-hidden"
          style={{
            backgroundColor: formBg,
            borderRadius,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            className="px-6 py-8 text-center"
            style={{ backgroundColor: headerBg }}
          >
            {logoData && (
              <div className="mb-4">
                <img src={logoData} alt="Logo" className="max-w-[150px] mx-auto" />
              </div>
            )}
            <h1
              className="font-bold mb-2"
              style={{ fontSize: headerFontSize, color: headerTextColor }}
            >
              {title || 'Untitled Form'}
            </h1>
            {description && (
              <p className="opacity-80" style={{ color: headerTextColor }}>
                {description}
              </p>
            )}
          </div>

          <div className="px-6 py-6">
            {fields.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No fields added yet</p>
                <p className="text-sm mt-2">Add fields in Form Structure to see them here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <PreviewField
                    key={index}
                    field={field}
                    textColor={textColor}
                    borderColor={borderColor}
                    borderRadius={borderRadius}
                    primaryColor={primaryColor}
                  />
                ))}
                <Button
                  variant="primary"
                  className="w-full"
                  style={{ backgroundColor: primaryColor }}
                  disabled
                >
                  {submitLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewField({
  field,
  textColor,
  borderColor,
  borderRadius,
  primaryColor,
}: {
  field: FormPreviewField
  textColor: string
  borderColor: string
  borderRadius: string
  primaryColor: string
}) {
  const displayOnly = ['paragraph', 'heading1', 'heading2', 'heading3', 'divider', 'title', 'label'].includes(field.type)

  if (field.type === 'paragraph') {
    return (
      <div className="my-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-200">
        <p className="leading-relaxed whitespace-pre-wrap" style={{ color: textColor }}>
          {field.label || 'Enter your informational text here...'}
        </p>
      </div>
    )
  }
  if (field.type === 'heading1') {
    return (
      <h2 className="text-2xl font-bold mt-8 mb-4 border-b-2 border-gray-100 pb-2 first:mt-0" style={{ color: textColor }}>
        {field.label || 'Major Section'}
      </h2>
    )
  }
  if (field.type === 'heading2') {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-3" style={{ color: textColor }}>
        {field.label || 'Subsection'}
      </h3>
    )
  }
  if (field.type === 'heading3') {
    return (
      <h4 className="text-lg font-medium mt-4 mb-2" style={{ color: textColor }}>
        {field.label || 'Minor Heading'}
      </h4>
    )
  }
  if (field.type === 'divider') {
    return <hr className="border-t-2 my-6" style={{ borderColor }} />
  }
  if (field.type === 'title') {
    return (
      <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: textColor }}>
        {field.label || 'Section Title'}
      </h4>
    )
  }
  if (field.type === 'label') {
    return (
      <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: textColor, opacity: 0.6 }}>
        {field.label || 'Label'}
      </p>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
        {field.label || 'Question'}
        {!displayOnly && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.type === 'textarea' && (
        <textarea
          className="w-full px-4 py-2 focus:outline-none focus:ring-2 disabled:opacity-50"
          style={{ borderWidth: '1px', borderColor, borderRadius, color: textColor }}
          rows={4}
          disabled
          placeholder="Your answer..."
        />
      )}
      {field.type === 'select' && field.options && (
        <select
          className="w-full px-4 py-2 focus:outline-none focus:ring-2 disabled:opacity-50"
          style={{ borderWidth: '1px', borderColor, borderRadius, color: textColor }}
          disabled
        >
          <option>Select...</option>
          {field.options.map((option, i) => (
            <option key={i}>{option}</option>
          ))}
        </select>
      )}
      {field.type === 'multiple' && field.options && (
        <div className="space-y-2">
          {field.options.map((option, i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" disabled className="w-4 h-4" style={{ accentColor: primaryColor }} />
              <span style={{ color: textColor }}>{option}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === 'checkbox' && field.options && (
        <div className="space-y-2">
          {field.options.map((option, i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" disabled className="w-4 h-4" style={{ accentColor: primaryColor }} />
              <span style={{ color: textColor }}>{option}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === 'rating' && (
        <div className="flex gap-2">
          {Array.from({ length: field.maxRating || 5 }, (_, i) => i + 1).map((star) => (
            <button key={star} type="button" disabled className="text-3xl text-gray-300">★</button>
          ))}
        </div>
      )}
      {field.type === 'linearScale' && (
        <div>
          {field.scaleLabels && (field.scaleLabels.min || field.scaleLabels.max) && (
            <div className="flex justify-between text-xs mb-2" style={{ color: textColor, opacity: 0.7 }}>
              <span>{field.scaleLabels.min || '1'}</span>
              <span>{field.scaleLabels.max || (field.maxRating || 5).toString()}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: field.maxRating || 5 }, (_, i) => i + 1).map((num) => (
              <div
                key={num}
                className="flex h-10 w-10 items-center justify-center text-sm font-medium"
                style={{ borderWidth: '2px', borderColor, borderRadius, color: textColor }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      )}
      {!['textarea', 'select', 'multiple', 'checkbox', 'rating', 'linearScale'].includes(field.type) && (
        <input
          type={field.type === 'link' ? 'url' : field.type}
          className="w-full px-4 py-2 focus:outline-none focus:ring-2 disabled:opacity-50"
          style={{ borderWidth: '1px', borderColor, borderRadius, color: textColor }}
          disabled
          placeholder="Your answer..."
        />
      )}
    </div>
  )
}
