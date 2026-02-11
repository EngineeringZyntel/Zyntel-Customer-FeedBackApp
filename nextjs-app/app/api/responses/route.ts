/**
 * Responses API Route
 * 
 * POST /api/responses - Submit a form response
 * 
 * Public endpoint (no auth required for submission)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { submitResponseSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
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
    
    // Create response
    const response = await prisma.response.create({
      data: {
        formId: form.id,
        responseData: responseData as any,
      },
      select: {
        id: true,
        submittedAt: true,
      },
    })
    
    // TODO: Send email notification (can be done via background job)
    // For now, we'll skip email to keep it simple
    
    return NextResponse.json(
      {
        message: 'Response submitted successfully',
        response,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submit response error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

