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
      router.push('/login')
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
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()
    router.push('/login')
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Forms</h1>
          <Link href="/dashboard/create">
            <Button variant="primary">+ Create Form</Button>
          </Link>
        </div>

        {forms.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">No forms yet. Create your first form!</p>
              <Link href="/dashboard/create">
                <Button variant="primary">Create Form</Button>
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

