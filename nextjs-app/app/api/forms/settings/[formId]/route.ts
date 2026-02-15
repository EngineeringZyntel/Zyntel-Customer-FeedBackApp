/**
 * Form Settings API Route
 * GET /api/forms/settings/[formId] - Get form-specific settings
 * PUT /api/forms/settings/[formId] - Update form-specific settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { handleApiError, ErrorResponses } from '@/lib/api-errors'

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) return ErrorResponses.unauthorized()

    const formId = parseInt(params.formId)
    
    // Get form with settings
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: user.userId,
      },
      select: {
        id: true,
        title: true,
        requirePassword: true,
        allowAnonymous: true,
        maxResponsesPerIP: true,
        cooldownMinutes: true,
        webhookUrl: true,
        slackWebhook: true,
        emailNotifications: true,
        notificationEmails: true,
        customDomain: true,
        domainVerified: true,
        domainDnsRecord: true,
      },
    })

    if (!form) return ErrorResponses.notFound('Form')

    return NextResponse.json({ settings: form })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) return ErrorResponses.unauthorized()

    const formId = parseInt(params.formId)
    const body = await request.json()

    // Verify ownership
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: user.userId,
      },
    })

    if (!form) return ErrorResponses.forbidden()

    // Update form settings
    const updated = await prisma.form.update({
      where: { id: formId },
      data: {
        requirePassword: body.requirePassword,
        password: body.password ? body.password : undefined, // Should hash in production
        allowAnonymous: body.allowAnonymous,
        maxResponsesPerIP: body.maxResponsesPerIP ? parseInt(body.maxResponsesPerIP) : null,
        cooldownMinutes: body.cooldownMinutes ? parseInt(body.cooldownMinutes) : null,
        webhookUrl: body.webhookUrl || null,
        slackWebhook: body.slackWebhook || null,
        emailNotifications: body.emailNotifications,
        notificationEmails: body.notificationEmails || null,
      },
    })

    return NextResponse.json({ 
      settings: updated, 
      message: 'Form settings updated successfully' 
    })
  } catch (error) {
    return handleApiError(error)
  }
}
