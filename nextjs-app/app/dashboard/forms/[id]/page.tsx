/**
 * Form Details Page
 * 
 * Shows form details, responses, and analytics for a specific form
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formsApi, responsesApi, analyticsApi, qrCodeApi } from '@/lib/api'
import { getCurrentUser } from '@/lib/jwt'
import { formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function FormDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const formId = parseInt(params.id as string)
  
  const [form, setForm] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'responses' | 'analytics' | 'share'>('responses')
  const [responseView, setResponseView] = useState<'cards' | 'table'>('cards')

  useEffect(() => {
    loadData()
  }, [formId])

  const loadData = async () => {
    try {
      setIsLoading(true)

      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }

      const formsResponse = await formsApi.getByUser(currentUser.userId) as { forms: any[] }
      const foundForm = formsResponse.forms.find((f: any) => f.id === formId)
      
      if (!foundForm) {
        router.push('/dashboard')
        return
      }
      
      setForm(foundForm)
      
      // Load responses
      const responsesData = await responsesApi.getByForm(formId) as { responses: any[] }
      setResponses(responsesData.responses || [])
      
      // Load analytics
      const analyticsData = await analyticsApi.getFormAnalytics(formId) as any
      setAnalytics(analyticsData)
      
      // Generate QR code
      const qrData = await qrCodeApi.generate(
        foundForm.formCode,
        `${window.location.origin}/form/${foundForm.formCode}`
      ) as { qrcode: string }
      setQrCode(qrData.qrcode)
    } catch (error: any) {
      console.error('Error loading form data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = () => {
    if (form) {
      const link = `${window.location.origin}/form/${form.formCode}`
      navigator.clipboard.writeText(link)
      alert('Form link copied to clipboard!')
    }
  }

  const formLink = form ? `${typeof window !== 'undefined' ? window.location.origin : ''}/form/${form?.formCode}` : ''

  const downloadQrCode = () => {
    if (!qrCode || !form) return
    const link = document.createElement('a')
    link.href = qrCode
    link.download = `${form.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-qrcode.png`
    link.click()
  }

  const printQrCode = () => {
    if (!qrCode || !form) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups to print the QR code.')
      return
    }
    const title = form.title || 'Feedback Form'
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${title}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; text-align: center; max-width: 400px; margin: 0 auto; }
            h1 { font-size: 1.25rem; margin-bottom: 8px; }
            p { color: #64748b; font-size: 0.875rem; margin-bottom: 16px; word-break: break-all; }
            img { max-width: 256px; height: auto; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Scan to open the form</p>
          <img src="${qrCode}" alt="QR Code" />
          <p style="margin-top: 16px;">${formLink}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const exportCSV = () => {
    if (!form || !responses.length) return
    const allKeys = new Set<string>()
    responses.forEach((r: any) => {
      const data = r.responseData || {}
      Object.keys(data).forEach((k) => allKeys.add(k))
    })
    const headers = ['Submitted At', ...Array.from(allKeys)]
    const escape = (v: string) => {
      const s = String(v ?? '')
      if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
      return s
    }
    const rows = responses.map((r: any) => {
      const data = r.responseData || {}
      const submittedAt = r.submittedAt ? new Date(r.submittedAt).toISOString() : ''
      return [submittedAt, ...Array.from(allKeys).map((k) => escape(Array.isArray(data[k]) ? data[k].join(', ') : String(data[k] ?? '')))]
    })
    const csv = [headers.map(escape).join(','), ...rows.map((row) => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${form.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-responses.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const [isDuplicating, setIsDuplicating] = useState(false)
  const handleDuplicate = async () => {
    if (!form) return
    setIsDuplicating(true)
    try {
      const result = await formsApi.duplicate(form.id) as { form: { id: number } }
      router.push(`/dashboard/forms/${result.form.id}`)
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate form')
    } finally {
      setIsDuplicating(false)
    }
  }

  const embedCode = formLink ? `<iframe src="${formLink}" width="600" height="600" frameborder="0" title="${form?.title || 'Form'}"></iframe>` : ''
  const copyEmbedCode = () => {
    if (!embedCode) return
    navigator.clipboard.writeText(embedCode)
    alert('Embed code copied to clipboard!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!form) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Back to Dashboard</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
              {form.description && (
                <p className="text-text-secondary mb-4">{form.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/forms/${form.id}/edit`}>
                  <Button variant="primary" size="sm">
                    Edit Form
                  </Button>
                </Link>
                <Button variant="secondary" size="sm" onClick={copyLink}>
                  Copy Link
                </Button>
                <Button variant="secondary" size="sm" onClick={handleDuplicate} disabled={isDuplicating}>
                  {isDuplicating ? 'Duplicating…' : 'Duplicate Form'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this form?')) {
                      await formsApi.delete(form.id)
                      router.push('/dashboard')
                    }
                  }}
                >
                  Delete Form
                </Button>
              </div>
            </Card>
          </div>
          
          <Card>
            <h3 className="font-semibold mb-4">Quick actions</h3>
            <p className="text-sm text-text-secondary mb-4">Share, embed, or get a QR code from the Share tab below.</p>
            <Button variant="secondary" size="sm" className="w-full" onClick={() => setActiveTab('share')}>
              Open Share
            </Button>
          </Card>
        </div>

        {/* Tabs: Responses | Analytics | Share (OpnForm-style) */}
        <div className="flex gap-4 mb-6 border-b border-border flex-wrap">
          <button
            onClick={() => setActiveTab('responses')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'responses'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary'
            }`}
          >
            Responses ({responses.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'analytics'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'share'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary'
            }`}
          >
            Share
          </button>
        </div>

        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div className="space-y-4">
            {responses.length > 0 && (
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={responseView === 'cards' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setResponseView('cards')}
                  >
                    Card View
                  </Button>
                  <Button
                    variant={responseView === 'table' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setResponseView('table')}
                  >
                    Table View
                  </Button>
                </div>
                <Button variant="secondary" size="sm" onClick={exportCSV}>
                  Export CSV
                </Button>
              </div>
            )}
            {responses.length === 0 ? (
              <Card>
                <div className="text-center py-12 text-text-secondary">
                  No responses yet. Share your form to start collecting feedback!
                </div>
              </Card>
            ) : responseView === 'cards' ? (
              // Card View (existing)
              responses.map((response, idx) => (
                <Card key={response.id}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm text-text-secondary">
                      Response #{responses.length - idx} • {formatDate(response.submittedAt)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(response.responseData as Record<string, any>).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span>{' '}
                        <span className="text-text-secondary">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            ) : (
              // Table View (new)
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium text-text-secondary">#</th>
                        <th className="text-left p-3 font-medium text-text-secondary">Submitted At</th>
                        {responses[0] && Object.keys(responses[0].responseData as Record<string, any>).map((key) => (
                          <th key={key} className="text-left p-3 font-medium text-text-secondary">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((response, idx) => (
                        <tr key={response.id} className="border-b border-border hover:bg-bg-secondary">
                          <td className="p-3 text-text-secondary">{responses.length - idx}</td>
                          <td className="p-3 text-text-secondary">{formatDate(response.submittedAt)}</td>
                          {Object.values(response.responseData as Record<string, any>).map((value, vIdx) => (
                            <td key={vIdx} className="p-3">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <div className="text-sm text-text-secondary mb-1">Total Responses</div>
                <div className="text-3xl font-bold">{analytics.total}</div>
              </Card>
              <Card>
                <div className="text-sm text-text-secondary mb-1">Last 7 Days</div>
                <div className="text-3xl font-bold">{analytics.trends.last7Days}</div>
              </Card>
              <Card>
                <div className="text-sm text-text-secondary mb-1">Trend</div>
                <div className={`text-3xl font-bold ${
                  analytics.trends.trend >= 0 ? 'text-success' : 'text-danger'
                }`}>
                  {analytics.trends.trend >= 0 ? '+' : ''}{analytics.trends.trend.toFixed(1)}%
                </div>
              </Card>
            </div>

            {analytics.dailyStats && analytics.dailyStats.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Response Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0066FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        )}

        {/* Share Tab (OpnForm-style: Link, Embed, QR) */}
        {activeTab === 'share' && (
          <div className="space-y-6">
            <p className="text-sm text-text-secondary">Share your form via link, embed it on your site, or use a QR code.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span aria-hidden>🔗</span> Form link
                </h3>
                <p className="text-sm text-text-secondary mb-3">Share this link so people can fill out your form.</p>
                <div className="bg-bg-secondary rounded-lg p-3 font-mono text-xs break-all mb-3">
                  {formLink}
                </div>
                <Button variant="primary" size="sm" className="w-full" onClick={copyLink}>
                  Copy link
                </Button>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span aria-hidden>📄</span> Embed on your site
                </h3>
                <p className="text-sm text-text-secondary mb-3">Paste this code into your website or blog.</p>
                <pre className="text-xs bg-bg-secondary p-3 rounded overflow-x-auto max-h-24 overflow-y-auto mb-3">
                  {embedCode}
                </pre>
                <Button variant="secondary" size="sm" className="w-full" onClick={copyEmbedCode}>
                  Copy embed code
                </Button>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span aria-hidden>📱</span> QR code
                </h3>
                <p className="text-sm text-text-secondary mb-3">Let people scan to open the form.</p>
                {qrCode ? (
                  <>
                    <div className="flex justify-center mb-3">
                      <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={downloadQrCode}>
                        Download
                      </Button>
                      <Button variant="secondary" size="sm" onClick={printQrCode}>
                        Print
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-text-secondary">Loading QR code…</p>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

