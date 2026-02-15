/**
 * Global User Settings Page
 * Manage account-wide settings, notifications, and defaults
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { getCurrentUser } from '@/lib/jwt'

interface UserSettings {
  theme: string
  timezone: string
  defaultFormTemplate?: string
  emailNotifications: boolean
  notificationEmail?: string
  notifyOnResponse: boolean
  notifyDaily: boolean
  notifyWeekly: boolean
  defaultPrimaryColor: string
  defaultFontFamily?: string
  defaultLogo?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/')
      return
    }
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (!response.ok) throw new Error('Failed to load settings')
      const data = await response.json()
      setSettings(data.settings)
    } catch (error: any) {
      setMessage('Error loading settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    setIsSaving(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      
      if (!response.ok) throw new Error('Failed to save settings')
      
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage('Error saving settings: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Loading settings...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Failed to load settings</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-text-secondary">Manage your preferences and default settings</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        {/* Appearance */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">⚙️ Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (system preference)</option>
              </select>
            </div>
            <Input
              label="Timezone"
              type="text"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              placeholder="America/New_York"
            />
          </div>
        </Card>

        {/* Email Notifications */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">📧 Email Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Enable email notifications</span>
            </label>

            {settings.emailNotifications && (
              <>
                <Input
                  label="Notification Email (optional)"
                  type="email"
                  value={settings.notificationEmail || ''}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  placeholder="Use a different email for notifications"
                />

                <div className="space-y-2 pl-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnResponse}
                      onChange={(e) => setSettings({ ...settings, notifyOnResponse: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Notify immediately when form is submitted</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.notifyDaily}
                      onChange={(e) => setSettings({ ...settings, notifyDaily: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Send daily summary (if responses received)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.notifyWeekly}
                      onChange={(e) => setSettings({ ...settings, notifyWeekly: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Send weekly analytics report</span>
                  </label>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Default Form Branding */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">🎨 Default Form Branding</h2>
          <p className="text-sm text-text-secondary mb-4">
            These settings will be applied to all new forms you create
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.defaultPrimaryColor}
                  onChange={(e) => setSettings({ ...settings, defaultPrimaryColor: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <input
                  type="text"
                  value={settings.defaultPrimaryColor}
                  onChange={(e) => setSettings({ ...settings, defaultPrimaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-border rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Default Font</label>
              <select
                value={settings.defaultFontFamily || ''}
                onChange={(e) => setSettings({ ...settings, defaultFontFamily: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">System Default</option>
                <option value="Inter, sans-serif">Inter</option>
                <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                <option value="'Georgia', serif">Georgia</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="ghost" onClick={() => router.push('/dashboard')}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
