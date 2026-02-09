/**
 * Analytics API Route
 * 
 * GET /api/analytics/[formId]
 * Returns comprehensive analytics for a form including:
 * - Total responses
 * - Responses by day (last 30 days)
 * - Response trends
 * - Field-level analytics
 * 
 * Requires authentication
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
    
    // Get total responses
    const totalResponses = await prisma.response.count({
      where: { formId },
    })
    
    // Get responses by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const responses = await prisma.response.findMany({
      where: {
        formId,
        submittedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        submittedAt: true,
        responseData: true,
      },
      orderBy: {
        submittedAt: 'asc',
      },
    })
    
    // Group by day
    const dailyStats: Record<string, number> = {}
    responses.forEach((response) => {
      const date = new Date(response.submittedAt).toISOString().split('T')[0]
      dailyStats[date] = (dailyStats[date] || 0) + 1
    })
    
    // Convert to array format
    const dailyStatsArray = Object.entries(dailyStats).map(([date, count]) => ({
      date,
      count,
    }))
    
    // Calculate trends
    const last7Days = responses.filter(
      (r) => new Date(r.submittedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
    
    const previous7Days = responses.filter(
      (r) => {
        const date = new Date(r.submittedAt)
        return date >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
               date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ).length
    
    const trend = previous7Days > 0
      ? ((last7Days - previous7Days) / previous7Days) * 100
      : last7Days > 0 ? 100 : 0
    
    // Field-level analytics (if needed)
    const fieldAnalytics: Record<string, any> = {}
    const formFields = form.fields as any[]
    
    if (Array.isArray(formFields)) {
      formFields.forEach((field) => {
        if (field.type === 'select' || field.type === 'multiple' || field.type === 'checkbox') {
          const fieldData: Record<string, number> = {}
          responses.forEach((response) => {
            const data = response.responseData as any
            const value = data[field.label]
            if (value) {
              // Handle comma-separated values for checkboxes
              const values = typeof value === 'string' ? value.split(', ') : [value]
              values.forEach((v: string) => {
                fieldData[v] = (fieldData[v] || 0) + 1
              })
            }
          })
          fieldAnalytics[field.label] = {
            type: field.type,
            options: Object.entries(fieldData).map(([option, count]) => ({
              option,
              count,
              percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
            })),
          }
        } else if (field.type === 'rating') {
          const ratings: number[] = []
          responses.forEach((response) => {
            const data = response.responseData as any
            const rating = parseInt(data[field.label])
            if (!isNaN(rating)) {
              ratings.push(rating)
            }
          })
          
          if (ratings.length > 0) {
            const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
            const ratingDistribution: Record<number, number> = {}
            ratings.forEach((r) => {
              ratingDistribution[r] = (ratingDistribution[r] || 0) + 1
            })
            
            fieldAnalytics[field.label] = {
              type: 'rating',
              average: avgRating,
              distribution: Object.entries(ratingDistribution).map(([rating, count]) => ({
                rating: parseInt(rating),
                count,
                percentage: (count / ratings.length) * 100,
              })),
            }
          }
        }
      })
    }
    
    return NextResponse.json({
      total: totalResponses,
      dailyStats: dailyStatsArray,
      trends: {
        last7Days,
        previous7Days,
        trend: Math.round(trend * 10) / 10, // Round to 1 decimal
      },
      fieldAnalytics,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

