/**
 * Public Form Page
 * 
 * Dynamic route: /form/[code]
 * Displays a public form that anyone can fill out
 * No authentication required
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formsApi, responsesApi } from '@/lib/api'

interface FormField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
}

export default function PublicFormPage() {
  const params = useParams()
  const formCode = params.code as string
  
  const [form, setForm] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadForm()
  }, [formCode])

  const loadForm = async () => {
    try {
      setIsLoading(true)
      const data = await formsApi.getByCode(formCode) as { form: any }
      setForm(data.form)
    } catch (err: any) {
      setError(err.message || 'Form not found')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await responsesApi.submit(formCode, responses)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit response')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (fieldLabel: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [fieldLabel]: value,
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <Card>
          <h1 className="text-2xl font-bold mb-4">Form Not Found</h1>
          <p className="text-text-secondary">{error || 'The form you\'re looking for doesn\'t exist.'}</p>
        </Card>
      </div>
    )
  }

  // Form closed (past close date)
  if (form.isClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold mb-2">Form closed</h2>
          <p className="text-text-secondary">This form is no longer accepting responses.</p>
        </Card>
      </div>
    )
  }

  // Response limit reached
  if (form.isLimitReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Response limit reached</h2>
          <p className="text-text-secondary">This form has received the maximum number of responses.</p>
        </Card>
      </div>
    )
  }

  if (submitted) {
    const thankYouMessage = form.thankYouMessage?.trim() || 'Your response has been submitted successfully.'
    const redirectUrl = form.thankYouRedirectUrl?.trim()

    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 3000)
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
          <p className="text-text-secondary whitespace-pre-line">{thankYouMessage}</p>
          {redirectUrl && (
            <p className="text-sm text-text-secondary mt-4">Redirecting you in a few seconds...</p>
          )}
        </Card>
      </div>
    )
  }

  const fields = (form.fields as FormField[]) || []
  const custom = (form.customization as Record<string, string>) || {}
  const bgColor = custom.backgroundColor || '#f7f9fc'
  const primaryColor = custom.primaryColor || '#0066FF'
  const headerBg = custom.headerBackgroundColor || '#f7f9fc'
  const fontFamily = custom.fontFamily || undefined
  const headerFontSize = custom.headerFontSize || '1.5rem'
  const bodyFontSize = custom.bodyFontSize || '1rem'
  const textColor = custom.textColor || '#0F1419'
  const borderRadius = custom.borderRadius || '0.5rem'

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        backgroundColor: bgColor,
        fontFamily,
        fontSize: bodyFontSize,
        color: textColor,
        ['--form-primary' as string]: primaryColor,
        ['--form-radius' as string]: borderRadius,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden" style={{ backgroundColor: 'white' }}>
          {/* Header section */}
          <div
            className="px-6 py-8 text-center"
            style={{ backgroundColor: headerBg }}
          >
            {form.logoData && (
              <div className="mb-4">
                <img
                  src={form.logoData}
                  alt="Logo"
                  className="max-w-[150px] mx-auto"
                />
              </div>
            )}
            <h1
              className="font-bold mb-2"
              style={{ fontSize: headerFontSize, color: textColor }}
            >
              {form.title}
            </h1>
            {form.description && (
              <p className="opacity-80 mb-0" style={{ color: textColor }}>
                {form.description}
              </p>
            )}
          </div>

          <div className="px-6 py-6">

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {fields.map((field, index) => {
              const displayOnly = ['paragraph', 'heading1', 'heading2', 'heading3', 'divider', 'title', 'label'].includes(field.type)

              if (field.type === 'paragraph') {
                return (
                  <p key={index} className="text-text-secondary">
                    {field.label || 'Your text here'}
                  </p>
                )
              }
              if (field.type === 'heading1') {
                return (
                  <h2 key={index} className="text-2xl font-bold text-text-primary">
                    {field.label || 'Heading 1'}
                  </h2>
                )
              }
              if (field.type === 'heading2') {
                return (
                  <h3 key={index} className="text-xl font-semibold text-text-primary">
                    {field.label || 'Heading 2'}
                  </h3>
                )
              }
              if (field.type === 'heading3') {
                return (
                  <h4 key={index} className="text-lg font-medium text-text-primary">
                    {field.label || 'Heading 3'}
                  </h4>
                )
              }
              if (field.type === 'divider') {
                return <hr key={index} className="border-border my-4" />
              }
              if (field.type === 'title') {
                return (
                  <p key={index} className="text-base font-semibold text-text-primary">
                    {field.label || 'Title'}
                  </p>
                )
              }
              if (field.type === 'label') {
                return (
                  <p key={index} className="text-sm font-medium text-text-secondary">
                    {field.label || 'Label'}
                  </p>
                )
              }

              return (
              <div key={index}>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {field.label}
                  {!displayOnly && <span className="text-danger ml-1">*</span>}
                </label>
                
                {field.type === 'textarea' && (
                  <textarea
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    required
                    value={responses[field.label] || ''}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  />
                )}
                
                {field.type === 'select' && field.options && (
                  <select
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    value={responses[field.label] || ''}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {field.options.map((option, optIdx) => (
                      <option key={optIdx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                
                {field.type === 'multiple' && field.options && (
                  <div className="space-y-2" role="radiogroup" aria-required>
                    {field.options.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={field.label}
                          value={option}
                          required={optIdx === 0}
                          className="w-4 h-4 text-primary"
                          onChange={() => handleFieldChange(field.label, option)}
                          checked={responses[field.label] === option}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {field.type === 'checkbox' && field.options && (
                  <div className="space-y-2">
                    {field.options.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={option}
                          className="w-4 h-4 text-primary"
                          onChange={(e) => {
                            const current = responses[field.label] || []
                            const updated = e.target.checked
                              ? [...(Array.isArray(current) ? current : []), option]
                              : (Array.isArray(current) ? current.filter((v: string) => v !== option) : [])
                            handleFieldChange(field.label, updated.join(', '))
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {field.type === 'rating' && (
                  <div className="flex gap-2">
                    {Array.from({ length: field.maxRating || 5 }, (_, i) => i + 1).map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleFieldChange(field.label, star.toString())}
                        className={`text-3xl ${
                          responses[field.label] && parseInt(responses[field.label]) >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                    <input
                      type="hidden"
                      value={responses[field.label] || ''}
                      required
                    />
                  </div>
                )}

                {field.type === 'linearScale' && (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: (field.maxRating || 5) }, (_, i) => i + 1).map((num) => (
                      <label key={num} className="flex cursor-pointer">
                        <input
                          type="radio"
                          name={field.label}
                          value={num}
                          required
                          className="sr-only peer"
                          onChange={() => handleFieldChange(field.label, num.toString())}
                          checked={responses[field.label] === num.toString()}
                        />
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-200 text-sm font-medium text-gray-700 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">
                          {num}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'time' && (
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={responses[field.label] || ''}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  />
                )}

                {field.type === 'link' && (
                  <input
                    type="url"
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://"
                    value={responses[field.label] || ''}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  />
                )}

                {!['textarea', 'select', 'multiple', 'checkbox', 'rating', 'linearScale', 'time', 'link'].includes(field.type) && (
                  <Input
                    type={field.type === 'link' ? 'url' : field.type}
                    required
                    value={responses[field.label] || ''}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  />
                )}
              </div>
            )})}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              style={{ backgroundColor: primaryColor }}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </form>
          </div>
        </Card>
      </div>
    </div>
  )
}

