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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
          <p className="text-text-secondary">Your response has been submitted successfully.</p>
        </Card>
      </div>
    )
  }

  const fields = (form.fields as FormField[]) || []

  return (
    <div className="min-h-screen bg-bg-secondary py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          {form.logoData && (
            <div className="mb-6 text-center">
              <img
                src={form.logoData}
                alt="Logo"
                className="max-w-[150px] mx-auto mb-4"
              />
            </div>
          )}
          
          <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-text-secondary mb-8">{form.description}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {field.label}
                  <span className="text-danger ml-1">*</span>
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
                  <div className="space-y-2">
                    {field.options.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={field.label}
                          value={option}
                          required
                          className="w-4 h-4 text-primary"
                          onChange={(e) => handleFieldChange(field.label, e.target.value)}
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
                
                {!['textarea', 'select', 'multiple', 'checkbox', 'rating'].includes(field.type) && (
                  <Input
                    type={field.type}
                    required
                    value={responses[field.label] || ''}
                    onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  />
                )}
              </div>
            ))}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

