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
    
    // Find form with response count
    const form = await prisma.form.findUnique({
      where: { formCode },
      include: {
        _count: { select: { responses: true } },
        user: { select: { email: true } },
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
    
    // Check per-IP response limit (if configured)
    if (form.maxResponsesPerIP) {
      const existingResponses = await prisma.response.count({
        where: {
          formId: form.id,
          ipAddress,
        },
      })
      
      if (existingResponses >= form.maxResponsesPerIP) {
        return NextResponse.json(
          { error: 'You have reached the maximum number of submissions for this form.' },
          { status: 403 }
        )
      }
    }
    
    // Check cooldown period (if configured)
    if (form.cooldownMinutes && ipAddress !== 'unknown') {
      const cooldownDate = new Date(Date.now() - form.cooldownMinutes * 60 * 1000)
      const recentResponse = await prisma.response.findFirst({
        where: {
          formId: form.id,
          ipAddress,
          submittedAt: { gte: cooldownDate },
        },
      })
      
      if (recentResponse) {
        const remainingMinutes = Math.ceil(
          (recentResponse.submittedAt.getTime() + form.cooldownMinutes * 60 * 1000 - Date.now()) / 60000
        )
        return NextResponse.json(
          { error: `Please wait ${remainingMinutes} minute(s) before submitting again.` },
          { status: 429 }
        )
      }
    }
    
    // Sanitize response data to prevent XSS
    const sanitized = sanitizeResponseData(responseData as Record<string, unknown>)

    // Create response
    const response = await prisma.response.create({
      data: {
        formId: form.id,
        responseData: sanitized as any,
        ipAddress,
        userAgent: request.headers.get('user-agent'),
      },
      select: {
        id: true,
        submittedAt: true,
      },
    })
    
    // TODO: Send email notification and webhook (can be done via background job)
    // For now, we'll skip this to keep it simple
    
    return NextResponse.json(
      {
        message: 'Response submitted successfully',
        response,
      },
      { 
        status: 201,
        headers: getRateLimitHeaders(rateLimitResult)
      }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

