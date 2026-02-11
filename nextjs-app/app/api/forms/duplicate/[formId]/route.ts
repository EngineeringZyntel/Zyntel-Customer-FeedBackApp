/**
 * Duplicate Form API Route
 *
 * POST /api/forms/duplicate/[formId]
 * Creates a copy of the form (same title + " (copy)", same fields/settings, new formCode).
 * Does not copy responses.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { generateFormCode } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formId = parseInt(params.formId, 10)
    if (isNaN(formId)) {
      return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 })
    }

    const existing = await prisma.form.findFirst({
      where: { id: formId, userId: user.userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    let formCode = generateFormCode()
    while (await prisma.form.findUnique({ where: { formCode } })) {
      formCode = generateFormCode()
    }

    const newForm = await prisma.form.create({
      data: {
        userId: user.userId,
        title: `${existing.title} (copy)`,
        description: existing.description,
        formCode,
        fields: existing.fields,
        logoData: existing.logoData,
        thankYouMessage: existing.thankYouMessage,
        thankYouRedirectUrl: existing.thankYouRedirectUrl,
        closeDate: existing.closeDate,
        responseLimit: existing.responseLimit,
      },
      include: {
        _count: { select: { responses: true } },
      },
    })

    return NextResponse.json(
      {
        form: {
          id: newForm.id,
          title: newForm.title,
          description: newForm.description,
          formCode: newForm.formCode,
          fields: newForm.fields,
          logoData: newForm.logoData,
          thankYouMessage: newForm.thankYouMessage,
          thankYouRedirectUrl: newForm.thankYouRedirectUrl,
          closeDate: newForm.closeDate,
          responseLimit: newForm.responseLimit,
          createdAt: newForm.createdAt,
          responseCount: newForm._count.responses,
        },
        message: 'Form duplicated successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Duplicate form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
