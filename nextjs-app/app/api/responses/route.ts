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
    
    // Find form
    const form = await prisma.form.findUnique({
      where: { formCode },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
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

