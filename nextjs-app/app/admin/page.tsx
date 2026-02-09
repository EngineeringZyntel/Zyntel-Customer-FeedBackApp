/**
 * Admin Panel Page
 * 
 * Comprehensive analytics dashboard showing:
 * - Overall statistics
 * - All forms with analytics
 * - Response trends
 * - Field-level insights
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formsApi, analyticsApi, authApi } from '@/lib/api'
import { getCurrentUser } from '@/lib/jwt'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface FormAnalytics {
  id: number
  title: string
  formCode: string
  totalResponses: number
  dailyStats: Array<{ date: string; count: number }>
  trends: {
    last7Days: number
    previous7Days: number
    trend: number
  }
  fieldAnalytics: Record<string, any>
}

const COLORS = ['#0066FF', '#00BA88', '#FF3B30', '#FFB800', '#9B59B6', '#E67E22']

export default function AdminPanelPage() {
  const router = useRouter()
  const [forms, setForms] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<FormAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedForm, setSelectedForm] = useState<number | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    loadData(currentUser.userId)
  }, [])

  const loadData = async (userId: number) => {
    try {
      setIsLoading(true)
      const formsResponse = await formsApi.getByUser(userId) as { forms: any[] }
      setForms(formsResponse.forms || [])
      
      // Load analytics for all forms
      const analyticsPromises = formsResponse.forms.map(async (form: any) => {
        try {
          const analyticsData = await analyticsApi.getFormAnalytics(form.id) as any
          return {
            id: form.id,
            title: form.title,
            formCode: form.formCode,
            ...analyticsData,
          }
        } catch (error) {
          return {
            id: form.id,
            title: form.title,
            formCode: form.formCode,
            totalResponses: form.responseCount || 0,
            dailyStats: [],
            trends: { last7Days: 0, previous7Days: 0, trend: 0 },
            fieldAnalytics: {},
          }
        }
      })
      
      const analyticsData = await Promise.all(analyticsPromises)
      setAnalytics(analyticsData)
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const totalResponses = analytics.reduce((sum, a) => sum + a.totalResponses, 0)
  const totalForms = forms.length
  const avgResponsesPerForm = totalForms > 0 ? Math.round(totalResponses / totalForms) : 0

  const overallTrend = analytics.length > 0
    ? analytics.reduce((sum, a) => sum + a.trends.last7Days, 0) -
      analytics.reduce((sum, a) => sum + a.trends.previous7Days, 0)
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Navigation */}
      <nav className="border-b border-border bg-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-2xl font-bold text-primary">
              Zyntel Feedback Admin
            </Link>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={() => {
                authApi.logout()
                router.push('/login')
              }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-sm text-text-secondary mb-1">Total Forms</div>
            <div className="text-3xl font-bold">{totalForms}</div>
          </Card>
          <Card>
            <div className="text-sm text-text-secondary mb-1">Total Responses</div>
            <div className="text-3xl font-bold">{totalResponses}</div>
          </Card>
          <Card>
            <div className="text-sm text-text-secondary mb-1">Avg per Form</div>
            <div className="text-3xl font-bold">{avgResponsesPerForm}</div>
          </Card>
          <Card>
            <div className="text-sm text-text-secondary mb-1">Trend (7 days)</div>
            <div className={`text-3xl font-bold ${overallTrend >= 0 ? 'text-success' : 'text-danger'}`}>
              {overallTrend >= 0 ? '+' : ''}{overallTrend}
            </div>
          </Card>
        </div>

        {/* Forms Analytics */}
        <div className="space-y-6">
          {analytics.map((formAnalytics) => (
            <Card key={formAnalytics.id} className="mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{formAnalytics.title}</h2>
                  <p className="text-text-secondary text-sm font-mono">{formAnalytics.formCode}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{formAnalytics.totalResponses}</div>
                  <div className="text-sm text-text-secondary">Total Responses</div>
                </div>
              </div>

              {/* Response Trends Chart */}
              {formAnalytics.dailyStats.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Response Trends (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formAnalytics.dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0066FF" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Field Analytics */}
              {Object.keys(formAnalytics.fieldAnalytics).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Field Analytics</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(formAnalytics.fieldAnalytics).map(([fieldName, analytics]: [string, any]) => (
                      <div key={fieldName} className="bg-bg-secondary p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">{fieldName}</h4>
                        {analytics.type === 'rating' && (
                          <div>
                            <div className="text-2xl font-bold mb-2">
                              {analytics.average.toFixed(1)} / {analytics.distribution.length}
                            </div>
                            <div className="text-sm text-text-secondary mb-3">Average Rating</div>
                            <ResponsiveContainer width="100%" height={150}>
                              <BarChart data={analytics.distribution}>
                                <Bar dataKey="count" fill="#0066FF" />
                                <XAxis dataKey="rating" />
                                <YAxis />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        {(analytics.type === 'select' || analytics.type === 'multiple' || analytics.type === 'checkbox') && (
                          <div>
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={analytics.options}
                                  dataKey="count"
                                  nameKey="option"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={60}
                                  label
                                >
                                  {analytics.options.map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-2 space-y-1">
                              {analytics.options.map((option: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{option.option}</span>
                                  <span className="font-semibold">
                                    {option.count} ({option.percentage.toFixed(1)}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formAnalytics.dailyStats.length === 0 && Object.keys(formAnalytics.fieldAnalytics).length === 0 && (
                <div className="text-center py-8 text-text-secondary">
                  No data available yet. Share your form to start collecting responses!
                </div>
              )}
            </Card>
          ))}
        </div>

        {analytics.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">No forms with analytics yet.</p>
              <Link href="/dashboard/create">
                <Button variant="primary">Create Your First Form</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

