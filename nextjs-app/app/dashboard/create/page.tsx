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
import { formsApi } from '@/lib/api'

interface FormField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
}

export default function CreateFormPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const addField = () => {
    setFields([...fields, { label: '', type: 'text' }])
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

    if (fields.length === 0) {
      setError('Add at least one field')
      return
    }

    // Validate fields
    for (const field of fields) {
      if (!field.label.trim()) {
        setError('All fields must have a label')
        return
      }
      if ((field.type === 'select' || field.type === 'multiple' || field.type === 'checkbox') && (!field.options || field.options.length === 0)) {
        setError(`${field.label} must have at least one option`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      const response = await formsApi.create({
        title,
        description,
        fields: fields.map(f => ({
          label: f.label,
          type: f.type,
          options: f.options?.filter(opt => opt.trim()),
          maxRating: f.maxRating || 5,
        })),
      })
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create form')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Form</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Form Details</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Form Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Customer Feedback Form"
              />
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this form is for..."
                />
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Form Fields</h2>
              <Button type="button" variant="secondary" onClick={addField}>
                + Add Field
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={index} className="border border-border rounded-lg p-4 bg-bg-secondary">
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
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="tel">Phone</option>
                        <option value="date">Date</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Dropdown</option>
                        <option value="multiple">Multiple Choice</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                  </div>

                  {(field.type === 'select' || field.type === 'multiple' || field.type === 'checkbox') && (
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

                  {field.type === 'rating' && (
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
              ))}
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 text-text-secondary">
                No fields yet. Click "Add Field" to get started.
              </div>
            )}
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Create Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

