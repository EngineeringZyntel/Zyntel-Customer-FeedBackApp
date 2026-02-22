/**
 * Trash Page
 * 
 * Shows soft-deleted forms with restore and permanent delete options
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { trashApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { getCurrentUser } from '@/lib/jwt'

export default function TrashPage() {
  const router = useRouter()
  const [forms, setForms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/')
      return
    }
    loadTrash()
  }, [])

  const loadTrash = async () => {
    try {
      setIsLoading(true)
      const data = await trashApi.getAll() as { forms: any[] }
      setForms(data.forms || [])
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        router.push('/')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (formId: number) => {
    if (processingIds.has(formId)) return

    setProcessingIds(new Set([...processingIds, formId]))
    try {
      await trashApi.restore(formId)
      setForms(forms.filter(f => f.id !== formId))
    } catch (error: any) {
      alert(error.message || 'Failed to restore form')
    } finally {
      setProcessingIds(new Set([...processingIds].filter(id => id !== formId)))
    }
  }

  const handlePermanentDelete = async (formId: number) => {
    if (processingIds.has(formId)) return

    if (!confirm('Are you sure? This will permanently delete the form and all its responses. This action cannot be undone.')) {
      return
    }

    setProcessingIds(new Set([...processingIds, formId]))
    try {
      await trashApi.permanentDelete(formId)
      setForms(forms.filter(f => f.id !== formId))
    } catch (error: any) {
      alert(error.message || 'Failed to delete form')
    } finally {
      setProcessingIds(new Set([...processingIds].filter(id => id !== formId)))
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Trash</h1>
            <p className="text-text-secondary mt-1">Deleted forms will be permanently removed after 30 days</p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        {forms.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg mb-4">No deleted forms</p>
              <p className="text-sm text-text-secondary">Deleted forms will appear here before being permanently removed</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{form.title}</h3>
                    {form.description && (
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">{form.description}</p>
                    )}
                    <div className="text-xs text-text-secondary space-y-1">
                      <p>Responses: {form.responseCount}</p>
                      <p>Deleted: {formatDate(form.deletedAt)}</p>
                      <p className="font-mono">{form.formCode}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleRestore(form.id)}
                      disabled={processingIds.has(form.id)}
                    >
                      {processingIds.has(form.id) ? 'Restoring...' : 'Restore'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handlePermanentDelete(form.id)}
                      disabled={processingIds.has(form.id)}
                    >
                      Delete Forever
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {forms.length > 0 && (
          <Card className="mt-6 bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Forms will be automatically deleted permanently after 30 days in trash.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
