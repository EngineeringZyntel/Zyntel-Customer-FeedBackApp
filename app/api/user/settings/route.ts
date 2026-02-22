/**
 * User Settings API Route
 * GET /api/user/settings - Get user settings
 * PUT /api/user/settings - Update user settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { handleApiError, ErrorResponses } from '@/lib/api-errors'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) return ErrorResponses.unauthorized()

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.userId },
    })

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.userId,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) return ErrorResponses.unauthorized()

    const body = await request.json()

    // Update or create user settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.userId },
      update: {
        theme: body.theme,
        timezone: body.timezone,
        defaultFormTemplate: body.defaultFormTemplate,
        emailNotifications: body.emailNotifications,
        notificationEmail: body.notificationEmail,
        notifyOnResponse: body.notifyOnResponse,
        notifyDaily: body.notifyDaily,
        notifyWeekly: body.notifyWeekly,
        defaultPrimaryColor: body.defaultPrimaryColor,
        defaultFontFamily: body.defaultFontFamily,
        defaultLogo: body.defaultLogo,
      },
      create: {
        userId: user.userId,
        theme: body.theme || 'light',
        timezone: body.timezone || 'UTC',
        defaultFormTemplate: body.defaultFormTemplate,
        emailNotifications: body.emailNotifications ?? true,
        notificationEmail: body.notificationEmail,
        notifyOnResponse: body.notifyOnResponse ?? true,
        notifyDaily: body.notifyDaily ?? false,
        notifyWeekly: body.notifyWeekly ?? true,
        defaultPrimaryColor: body.defaultPrimaryColor || '#0066FF',
        defaultFontFamily: body.defaultFontFamily,
        defaultLogo: body.defaultLogo,
      },
    })

    return NextResponse.json({ settings, message: 'Settings updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
