/**
 * Responses API Route
 * 
 * POST /api/responses - Submit a form response
 * 
 * Public endpoint (no auth required for submission)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sanitizeResponseData } from '@/lib/sanitize'
import { submitResponseSchema } from '@/lib/validations'
import { handleApiError, ErrorResponses } from '@/lib/api-errors'
import { rateLimitFormSubmission, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    
    // Rate limit check
    const rateLimitResult = await rateLimitFormSubmission(ipAddress)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429, 
          headers: getRateLimitHeaders(rateLimitResult)
        }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const validationResult = submitResponseSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    const { formCode, responseData } = validationResult.data

    // Select only basic columns that exist in all DB versions (avoids missing column errors)
    const form = await prisma.form.findUnique({
      where: { formCode },
      select: {
        id: true,
        closeDate: true,
        responseLimit: true,
        _count: { select: { responses: true } },
      },
    })

    if (!form) {
      return ErrorResponses.notFound('Form')
    }

    // Check if form is closed (close date passed)
    if (form.closeDate && new Date() > form.closeDate) {
      return NextResponse.json(
        { error: 'This form is no longer accepting responses.' },
        { status: 403 }
      )
    }

    // Check response limit
    if (form.responseLimit != null && form._count.responses >= form.responseLimit) {
      return NextResponse.json(
        { error: 'This form has reached its response limit.' },
        { status: 403 }
      )
    }

    // Note: maxResponsesPerIP and cooldownMinutes checks are skipped if those columns don't exist in DB
    // Run `npx prisma db push` to add these columns for advanced rate limiting
    
    // Ensure responseData is plain JSON-serializable (no Date/function etc.)
    const plainData = jsonSafe(responseData as Record<string, unknown>)
    const sanitized = sanitizeResponseData(plainData)

    // Create response
    const created = await prisma.response.create({
      data: {
        formId: form.id,
        responseData: sanitized as object,
        ipAddress: ipAddress || null,
        userAgent: request.headers.get('user-agent') ?? null,
      },
      select: {
        id: true,
        submittedAt: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Response submitted successfully',
        response: {
          id: created.id,
          submittedAt: created.submittedAt.toISOString(),
        },
      },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    )
  } catch (error) {
    console.error('POST /api/responses error:', error)
    return handleApiError(error)
  }
}

/** Keep only JSON-serializable values to avoid Prisma/serialization issues */
function jsonSafe(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value
    } else if (Array.isArray(value)) {
      out[key] = value.map((v) =>
        typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' || v === null ? v : String(v)
      )
    } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      out[key] = jsonSafe(value as Record<string, unknown>)
    } else {
      out[key] = value instanceof Date ? value.toISOString() : String(value)
    }
  }
  return out
}

