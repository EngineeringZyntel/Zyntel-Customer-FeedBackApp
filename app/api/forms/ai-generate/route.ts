/**
 * AI Form Generator API
 * POST /api/forms/ai-generate
 * Body: { prompt: string }
 * Returns: { title, description, fields }.
 * Uses GROQ_API_KEY (free) or OPENAI_API_KEY; fallback to keyword templates if neither set.
 */

import { NextRequest, NextResponse } from 'next/server'

const VALID_FIELD_TYPES = [
  'text', 'textarea', 'email', 'number', 'tel', 'date', 'time', 'link',
  'select', 'multiple', 'checkbox', 'rating', 'linearScale',
  'heading1', 'heading2', 'paragraph', 'divider',
] as const

interface GeneratedField {
  label: string
  type: string
  options?: string[]
  maxRating?: number
}

interface GeneratedForm {
  title: string
  description: string
  fields: GeneratedField[]
}

/** Keyword-based fallback when no OpenAI key - returns a sensible form from prompt */
function fallbackFromPrompt(prompt: string): GeneratedForm {
  const lower = prompt.toLowerCase().trim()
  if (!lower) {
    return {
      title: 'New Form',
      description: 'Describe your form above and click Generate, or add fields manually.',
      fields: [
        { label: 'Your name', type: 'text' },
        { label: 'Email', type: 'email' },
        { label: 'Message', type: 'textarea' },
      ],
    }
  }
  if (lower.includes('contact') || lower.includes('inquiry') || lower.includes('message')) {
    return {
      title: 'Contact Us',
      description: 'Send us a message and we\'ll get back to you.',
      fields: [
        { label: 'Your name', type: 'text' },
        { label: 'Email', type: 'email' },
        { label: 'Subject', type: 'select', options: ['General inquiry', 'Support', 'Feedback', 'Other'] },
        { label: 'Message', type: 'textarea' },
      ],
    }
  }
  if (lower.includes('feedback') || lower.includes('survey') || lower.includes('nps') || lower.includes('rating')) {
    return {
      title: 'Feedback Survey',
      description: 'We\'d love to hear your feedback.',
      fields: [
        { label: 'How would you rate your experience?', type: 'rating', maxRating: 5 },
        { label: 'What did you like most?', type: 'textarea' },
        { label: 'What could we improve?', type: 'textarea' },
      ],
    }
  }
  if (lower.includes('event') || lower.includes('registration')) {
    return {
      title: 'Event Registration',
      description: 'Register for our upcoming event.',
      fields: [
        { label: 'Full name', type: 'text' },
        { label: 'Email', type: 'email' },
        { label: 'Phone number', type: 'tel' },
        { label: 'Ticket type', type: 'select', options: ['General admission', 'VIP', 'Student'] },
        { label: 'Dietary requirements', type: 'checkbox', options: ['Vegetarian', 'Vegan', 'None'] },
      ],
    }
  }
  if (lower.includes('job') || lower.includes('application') || lower.includes('career')) {
    return {
      title: 'Job Application',
      description: 'Apply for this position.',
      fields: [
        { label: 'Full name', type: 'text' },
        { label: 'Email', type: 'email' },
        { label: 'Phone', type: 'tel' },
        { label: 'Position', type: 'text' },
        { label: 'Resume or cover letter', type: 'textarea' },
      ],
    }
  }
  // Default: generic form
  return {
    title: 'Custom Form',
    description: 'Your responses help us improve.',
    fields: [
      { label: 'Name', type: 'text' },
      { label: 'Email', type: 'email' },
      { label: 'Comments or feedback', type: 'textarea' },
    ],
  }
}

/** Normalize AI response to valid field types */
function normalizeFields(fields: GeneratedField[]): GeneratedField[] {
  return fields.map((f) => {
    const type = VALID_FIELD_TYPES.includes(f.type as any) ? f.type : 'text'
    const field: GeneratedField = { label: f.label || 'Question', type }
    if (['select', 'multiple', 'checkbox'].includes(type) && f.options?.length) {
      field.options = f.options.filter(Boolean)
    }
    if (['rating', 'linearScale'].includes(type) && f.maxRating) {
      field.maxRating = Math.min(10, Math.max(1, f.maxRating))
    }
    return field
  }).filter((f) => f.label?.trim())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

    // Prefer Groq (free tier, no card) then OpenAI
    const groqKey = process.env.GROQ_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    const apiKey = groqKey || openaiKey

    if (!apiKey) {
      const fallback = fallbackFromPrompt(prompt)
      return NextResponse.json({
        ...fallback,
        message: 'Tip: set GROQ_API_KEY (free at console.groq.com) or OPENAI_API_KEY in .env for AI-generated forms.',
      })
    }

    const systemPrompt = `You are a form builder assistant. Given a short description of a form, respond with a JSON object only (no markdown, no code block) with this exact structure:
{
  "title": "string - form title",
  "description": "string - short form description",
  "fields": [
    { "label": "string", "type": "one of: text, textarea, email, number, tel, date, time, link, select, multiple, checkbox, rating, linearScale" }
  ]
}
Rules:
- Use only the field types listed. For single-choice use "multiple", for dropdown use "select", for multi-select use "checkbox".
- For "select", "multiple", or "checkbox" include "options": ["Option 1", "Option 2", ...].
- For "rating" or "linearScale" include "maxRating": 5 or 10.
- Prefer 3-8 fields. Keep labels clear and short.`

    const useGroq = Boolean(groqKey)
    const url = useGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions'
    const model = useGroq ? 'llama-3.1-8b-instant' : 'gpt-4o-mini'

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt || 'A simple contact form with name, email, and message.' },
        ],
        temperature: 0.5,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(useGroq ? 'Groq' : 'OpenAI', 'API error:', res.status, err)
      const fallback = fallbackFromPrompt(prompt)
      return NextResponse.json({ ...fallback, message: 'AI unavailable; using template.' })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim() || ''
    let parsed: GeneratedForm
    try {
      const jsonStr = content.replace(/^```json?\s*|\s*```$/g, '').trim()
      parsed = JSON.parse(jsonStr)
    } catch {
      parsed = fallbackFromPrompt(prompt)
    }

    if (!parsed.fields || !Array.isArray(parsed.fields)) {
      parsed = fallbackFromPrompt(prompt)
    }

    const form: GeneratedForm = {
      title: parsed.title && String(parsed.title).trim() ? String(parsed.title).trim() : 'New Form',
      description: parsed.description && String(parsed.description).trim() ? String(parsed.description).trim() : '',
      fields: normalizeFields(parsed.fields),
    }

    return NextResponse.json(form)
  } catch (e) {
    console.error('AI generate error:', e)
    return NextResponse.json(
      {
        title: 'New Form',
        description: 'Something went wrong. You can add fields manually.',
        fields: [
          { label: 'Your name', type: 'text' },
          { label: 'Email', type: 'email' },
          { label: 'Message', type: 'textarea' },
        ],
      },
      { status: 200 }
    )
  }
}
