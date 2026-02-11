/**
 * Validation Schemas using Zod
 * 
 * Type-safe validation for API requests and forms
 */

import { z } from 'zod'

// Auth validations
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Form validations
export const createFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  fields: z.array(z.object({
    label: z.string().min(1, 'Field label is required'),
    type: z.enum(['text', 'email', 'number', 'tel', 'date', 'textarea', 'select', 'multiple', 'checkbox', 'rating']),
    options: z.array(z.string()).optional(),
    maxRating: z.number().optional(),
  })),
  logoData: z.string().optional(),
  thankYouMessage: z.string().max(1000).optional(),
  thankYouRedirectUrl: z.string().max(500).optional(),
  closeDate: z.string().optional(),
  responseLimit: z.number().int().min(1).optional().nullable(),
})

export const submitResponseSchema = z.object({
  formCode: z.string().min(1, 'Form code is required'),
  responseData: z.record(z.any()),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateFormInput = z.infer<typeof createFormSchema>
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>

