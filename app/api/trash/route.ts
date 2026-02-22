/**
 * Trash API Routes
 * 
 * GET /api/trash - Get all soft-deleted forms for current user
 * POST /api/trash/restore/[formId] - Restore a soft-deleted form
 * DELETE /api/trash/[formId] - Permanently delete a form
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// Get all trashed forms
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trashedForms = await prisma.form.findMany({
      where: {
        userId: user.userId,
        isDeleted: true,
      },
      include: {
        _count: {
          select: { responses: true },
        },
      },
      orderBy: {
        deletedAt: 'desc',
      },
    })

    const forms = trashedForms.map(form => ({
      id: form.id,
      title: form.title,
      description: form.description,
      formCode: form.formCode,
      deletedAt: form.deletedAt,
      responseCount: form._count.responses,
      createdAt: form.createdAt,
    }))

    return NextResponse.json({ forms })
  } catch (error) {
    console.error('Get trash error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
