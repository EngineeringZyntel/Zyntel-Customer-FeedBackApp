/**
 * Get Form Responses API Route
 * 
 * GET /api/responses/[formId]
 * Retrieves all responses for a form (requires authentication)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
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
    
    // Get responses
    const responses = await prisma.response.findMany({
      where: { formId },
      orderBy: {
        submittedAt: 'desc',
      },
      select: {
        id: true,
        responseData: true,
        submittedAt: true,
      },
    })
    
    return NextResponse.json({ responses })
  } catch (error) {
    console.error('Get responses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

