/**
 * Permanently Delete Form from Trash
 * 
 * DELETE /api/trash/[formId]
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function DELETE(
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

    // Permanently delete
    await prisma.form.delete({
      where: { id: formId },
    })

    return NextResponse.json({
      message: 'Form permanently deleted',
    })
  } catch (error) {
    console.error('Permanent delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
