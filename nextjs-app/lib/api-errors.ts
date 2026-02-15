/**
 * Standardized API Error Handling
 * Provides consistent error responses across all API routes
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    )
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    )
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any }
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'field'
      return NextResponse.json(
        { error: `A record with this ${field} already exists` },
        { status: 409 }
      )
    }
    
    // Record not found
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  // Fallback for unknown errors
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  )
}

// Common error responses for reuse
export const ErrorResponses = {
  unauthorized: () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  forbidden: () => NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
  notFound: (resource = 'Resource') => NextResponse.json({ error: `${resource} not found` }, { status: 404 }),
  badRequest: (message = 'Bad request') => NextResponse.json({ error: message }, { status: 400 }),
  tooManyRequests: (message = 'Too many requests. Please try again later.') => NextResponse.json({ error: message }, { status: 429 }),
}
