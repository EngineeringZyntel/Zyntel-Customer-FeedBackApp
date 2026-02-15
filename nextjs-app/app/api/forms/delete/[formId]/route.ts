/**
 * Delete Form API Route
 * 
 * DELETE /api/forms/delete/[formId]
 * Deletes a form (requires authentication)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    // Check authentication
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const formId = parseInt(params.formId)
    
    // Verify form belongs to user
    const form = await prisma.form.findUnique({
      where: { id: formId },
    })
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }
    
    if (form.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Soft delete form
    const deletedForm = await prisma.form.update({
      where: { id: formId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })
    
    return NextResponse.json({
      message: 'Form moved to trash',
      form: {
        id: deletedForm.id,
        title: deletedForm.title,
      },
    })
  } catch (error) {
    console.error('Delete form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

