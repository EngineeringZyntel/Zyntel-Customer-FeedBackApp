/**
 * Form by ID API Route
 *
 * GET /api/forms/id/[formId] - Get form by ID (authenticated, for editing)
 * PUT /api/forms/id/[formId] - Update form
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { updateFormSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formId = parseInt(params.formId)
    if (isNaN(formId)) {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 })
    }

    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: user.userId,
        isDeleted: false,
      },
      include: {
        _count: { select: { responses: true } },
      },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const { _count, ...formData } = form
    return NextResponse.json({
      form: {
        ...formData,
        responseCount: _count.responses,
      },
    })
  } catch (error) {
    console.error('Get form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formId = parseInt(params.formId)
    if (isNaN(formId)) {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 })
    }

    const body = await request.json()
    const validationResult = updateFormSchema.safeParse({ ...body, id: formId })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const existing = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: user.userId,
        isDeleted: false,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const data = validationResult.data
    const updateData: Record<string, unknown> = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.fields !== undefined) updateData.fields = data.fields
    if (data.logoData !== undefined) updateData.logoData = data.logoData
    if (data.customization !== undefined) updateData.customization = data.customization
    if (data.thankYouMessage !== undefined) updateData.thankYouMessage = data.thankYouMessage
    if (data.thankYouRedirectUrl !== undefined) updateData.thankYouRedirectUrl = data.thankYouRedirectUrl
    if (data.closeDate !== undefined) updateData.closeDate = data.closeDate ? new Date(data.closeDate) : null
    if (data.responseLimit !== undefined) updateData.responseLimit = data.responseLimit

    const form = await prisma.form.update({
      where: { id: formId },
      data: updateData as any,
      include: {
        _count: { select: { responses: true } },
      },
    })

    const { _count, ...formData } = form
    return NextResponse.json({
      form: {
        ...formData,
        responseCount: _count.responses,
      },
      message: 'Form updated successfully',
    })
  } catch (error) {
    console.error('Update form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
