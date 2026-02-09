/**
 * QR Code Generation API Route
 * 
 * POST /api/qrcode
 * Generates a QR code for a form URL
 * 
 * Request Body:
 * - formCode: string
 * - formUrl: string (optional, will be generated if not provided)
 * - logoData: string (optional base64 image)
 */

import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { getUserFromRequest } from '@/lib/auth'

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
    const { formCode, formUrl, logoData } = body
    
    if (!formCode) {
      return NextResponse.json(
        { error: 'Form code is required' },
        { status: 400 }
      )
    }
    
    // Generate form URL if not provided
    const url = formUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/form/${formCode}`
    
    // Generate QR code
    let qrCodeDataUrl: string
    
    if (logoData) {
      // QR code with logo (simplified - would need canvas manipulation for better logo integration)
      qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
    } else {
      qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
    }
    
    return NextResponse.json({
      qrcode: qrCodeDataUrl,
      url,
    })
  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}

