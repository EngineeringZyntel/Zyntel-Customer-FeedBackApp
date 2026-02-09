/**
 * Get Form by Code API Route
 * 
 * GET /api/forms/[formCode]
 * Retrieves a form by its code (public endpoint, no auth required)
 * 
 * Used for displaying public forms
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { formCode: string } }
) {
  try {
    const { formCode } = params
    
    const form = await prisma.form.findUnique({
      where: { formCode },
      select: {
        id: true,
        title: true,
        description: true,
        fields: true,
        logoData: true,
        createdAt: true,
      },
    })
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found', formCode },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ form })
  } catch (error) {
    console.error('Get form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

