/**
 * Dashboard Page
 * 
 * Main dashboard showing user's forms
 * Requires authentication
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formsApi, authApi } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { getCurrentUser } from '@/lib/jwt'

interface Form {
  id: number
  title: string
  description: string | null
  formCode: string
  responseCount: number
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/')
      return
    }
    
    setUser(currentUser)
    loadForms(currentUser.userId)
  }, [])

  const loadForms = async (userId: number) => {
    try {
      setIsLoading(true)
      const response = await formsApi.getByUser(userId) as { forms: Form[] }
      setForms(response.forms || [])
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        router.push('/')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    router.push('/')
  }

  const handleDelete = async (formId: number) => {
    if (!confirm('Are you sure you want to delete this form?')) return
    
    try {
      await formsApi.delete(formId)
      if (user) {
        loadForms(user.userId)
      }
    } catch (error: any) {
      alert('Error deleting form: ' + error.message)
    }
  }

  const copyLink = (formCode: string) => {
    const link = `${window.location.origin}/form/${formCode}`
    navigator.clipboard.writeText(link)
    alert('Form link copied to clipboard!')
  }

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
              Zyntel Feedback
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/help">
                <Button variant="ghost">Help</Button>
              </Link>
              <Link href="/trash">
                <Button variant="ghost">Trash</Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost">Admin Panel</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview strip (Loop-style metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Forms</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{forms.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total responses</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {forms.reduce((sum, f) => sum + (f.responseCount || 0), 0)}
            </p>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Your Forms</h1>
          <div className="flex gap-2">
            <Link href="/dashboard/create?ai=1">
              <Button variant="secondary">✨ Create with AI</Button>
            </Link>
            <Link href="/dashboard/create">
              <Button variant="primary">+ Create Form</Button>
            </Link>
          </div>
        </div>

        {forms.length === 0 ? (
          <Card>
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4" aria-hidden>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Create your first form to start collecting feedback from customers.</p>
              <Link href="/dashboard/create">
                <Button variant="primary">Create your first form</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} hover>
                <div
                  onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                  className="cursor-pointer"
                >
                  <h3 className="text-xl font-semibold mb-2">{form.title}</h3>
                  {form.description && (
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-sm text-text-secondary mb-4">
                    <span>{form.responseCount} responses</span>
                    <span>{formatRelativeTime(form.createdAt)}</span>
                  </div>
                  <div className="text-xs text-text-secondary font-mono bg-bg-secondary px-2 py-1 rounded">
                    {form.formCode}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyLink(form.formCode)
                    }}
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(form.id)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

