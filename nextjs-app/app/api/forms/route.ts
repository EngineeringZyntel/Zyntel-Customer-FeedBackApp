/**
 * Forms API Route
 * 
 * POST /api/forms - Create a new form
 * GET /api/forms/user/[userId] - Get all forms for a user
 * 
 * Requires authentication via Bearer token
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { createFormSchema } from '@/lib/validations'
import { generateFormCode } from '@/lib/utils'

// Create form
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const validationResult = createFormSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    const raw = validationResult.data
    const title = raw.title
    const description = raw.description ?? null
    const fields = raw.fields
    const logoData = raw.logoData ?? null
    const thankYouMessage = raw.thankYouMessage?.trim() || null
    const thankYouRedirectUrl = raw.thankYouRedirectUrl?.trim() || null
    const closeDate = raw.closeDate ? new Date(raw.closeDate) : null
    const responseLimit = raw.responseLimit ?? null

    // Generate unique form code
    let formCode = generateFormCode()
    let codeExists = true
    
    // Ensure code is unique
    while (codeExists) {
      const existing = await prisma.form.findUnique({
        where: { formCode },
      })
      if (!existing) {
        codeExists = false
      } else {
        formCode = generateFormCode()
      }
    }
    
    // Create form
    const form = await prisma.form.create({
      data: {
        userId: user.userId,
        title,
        description,
        formCode,
        fields: fields as any,
        logoData,
        thankYouMessage,
        thankYouRedirectUrl,
        closeDate,
        responseLimit,
      },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    })
    
    return NextResponse.json(
      {
        form: {
          ...form,
          responseCount: form._count.responses,
        },
        message: 'Form created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get user's forms
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')
    
    // Use authenticated user's ID (ignore userId param for security)
    const targetUserId = user.userId
    
    // Get forms with response counts
    const forms = await prisma.form.findMany({
      where: {
        userId: targetUserId,
      },
      include: {
        _count: {
          select: { responses: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    const formsWithCounts = forms.map(form => ({
      id: form.id,
      userId: form.userId,
      title: form.title,
      description: form.description,
      formCode: form.formCode,
      fields: form.fields,
      logoData: form.logoData,
      thankYouMessage: form.thankYouMessage,
      thankYouRedirectUrl: form.thankYouRedirectUrl,
      closeDate: form.closeDate,
      responseLimit: form.responseLimit,
      createdAt: form.createdAt,
      responseCount: form._count.responses,
    }))
    
    return NextResponse.json({ forms: formsWithCounts })
  } catch (error) {
    console.error('Get forms error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

