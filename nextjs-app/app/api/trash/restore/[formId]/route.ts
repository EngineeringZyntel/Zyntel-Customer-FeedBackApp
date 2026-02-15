/**
 * Restore Form from Trash
 * 
 * POST /api/trash/restore/[formId]
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

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

    // Verify form belongs to user and is deleted
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: user.userId,
        isDeleted: true,
      },
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found in trash' },
        { status: 404 }
      )
    }

    // Restore form
    const restoredForm = await prisma.form.update({
      where: { id: formId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    })

    return NextResponse.json({
      form: {
        id: restoredForm.id,
        title: restoredForm.title,
      },
      message: 'Form restored successfully',
    })
  } catch (error) {
    console.error('Restore form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
