/**
 * Form Builder Right Sidebar
 * Home tab (default): themes, reset, dashboard link. Customize tab: collapsible Header + Rest of form.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FormHeaderSection, type FormHeaderConfig } from './FormHeaderSection'
import { cn } from '@/lib/utils'

export interface FormCustomization {
  headerBackgroundColor?: string
  headerTextColor?: string
  backgroundColor?: string
  primaryColor?: string
  textColor?: string
  fontFamily?: string
  headerFontSize?: string
  bodyFontSize?: string
  borderRadius?: string
  formBackgroundColor?: string
  fieldBorderColor?: string
}

/** Default customization (used for Reset) */
export const DEFAULT_CUSTOMIZATION: FormCustomization = {}

/** Preset themes for quick toggling */
export const PRESET_THEMES: Record<string, FormCustomization> = {
  light: {
    headerBackgroundColor: '#f8fafc',
    headerTextColor: '#0f172a',
    backgroundColor: '#f1f5f9',
    formBackgroundColor: '#ffffff',
    primaryColor: '#2563eb',
    textColor: '#0f172a',
    fieldBorderColor: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    headerFontSize: '1.5rem',
    bodyFontSize: '1rem',
    borderRadius: '0.5rem',
  },
  dark: {
    headerBackgroundColor: '#1e293b',
    headerTextColor: '#f1f5f9',
    backgroundColor: '#0f172a',
    formBackgroundColor: '#1e293b',
    primaryColor: '#60a5fa',
    textColor: '#e2e8f0',
    fieldBorderColor: '#475569',
    fontFamily: 'Inter, system-ui, sans-serif',
    headerFontSize: '1.5rem',
    bodyFontSize: '1rem',
    borderRadius: '0.5rem',
  },
  brand: {
    headerBackgroundColor: '#0066FF',
    headerTextColor: '#ffffff',
    backgroundColor: '#f0f7ff',
    formBackgroundColor: '#ffffff',
    primaryColor: '#0066FF',
    textColor: '#0F1419',
    fieldBorderColor: '#D1D5DB',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    headerFontSize: '1.75rem',
    bodyFontSize: '1rem',
    borderRadius: '0.75rem',
  },
}

interface FormBuilderRightSidebarProps {
  headerConfig: FormHeaderConfig
  customization: FormCustomization
  onHeaderChange: (config: FormHeaderConfig) => void
  onCustomizationChange: (customization: FormCustomization) => void
  /** Dashboard URL for Home tab "Back to Dashboard" link (e.g. /dashboard) */
  dashboardHref?: string
  /** When true, render without fixed aside (e.g. inside OpnForm layout) */
  inline?: boolean
  /** Initial tab when used inside layout */
  initialTab?: 'home' | 'customize'
}

const FONT_OPTIONS = [
  { value: '', label: 'Default (System)' },
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: "'Plus Jakarta Sans', sans-serif", label: 'Plus Jakarta Sans' },
  { value: "'Georgia', serif", label: 'Georgia' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' },
]

export function FormBuilderRightSidebar({
  headerConfig,
  customization,
  onHeaderChange,
  onCustomizationChange,
  dashboardHref = '/dashboard',
  inline = false,
  initialTab = 'home',
}: FormBuilderRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'customize'>(initialTab)
  const [customizeOpen, setCustomizeOpen] = useState<'header' | 'body' | null>(null)

  const update = (key: keyof FormCustomization, value: string | undefined) => {
    onCustomizationChange({ ...customization, [key]: value })
  }

  const applyTheme = (themeKey: string) => {
    const theme = PRESET_THEMES[themeKey]
    if (theme) onCustomizationChange({ ...theme })
  }

  const resetCustomization = () => {
    onCustomizationChange({ ...DEFAULT_CUSTOMIZATION })
  }

  const Wrapper = inline ? 'div' : 'aside'
  return (
    <Wrapper className={inline ? 'w-full' : 'w-80 h-screen bg-white border-l border-gray-200 flex flex-col'}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Style</h2>
        <p className="text-xs text-gray-500 mt-1">Themes &amp; customization</p>
      </div>

      {/* Tabs: Home | Customize */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            activeTab === 'home' ? 'text-primary bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          Home
          {activeTab === 'home' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('customize')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            activeTab === 'customize' ? 'text-primary bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          Customize
          {activeTab === 'customize' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' ? (
          <div className="p-4 space-y-6">
            {/* Back to Dashboard */}
            {dashboardHref && (
              <Link
                href={dashboardHref}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span aria-hidden>←</span> Back to Dashboard
              </Link>
            )}

            {/* Quick themes */}
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick themes</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'brand'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyTheme(key)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-xs font-medium transition',
                      key === 'light' && 'border-gray-200 bg-slate-50 hover:border-gray-300',
                      key === 'dark' && 'border-slate-600 bg-slate-800 text-white hover:border-slate-500',
                      key === 'brand' && 'border-blue-500 bg-blue-50 text-blue-800 hover:border-blue-600'
                    )}
                  >
                    <span className="w-8 h-8 rounded-full border border-white/30 shrink-0" style={key === 'light' ? { backgroundColor: '#f8fafc' } : key === 'dark' ? { backgroundColor: '#1e293b' } : { backgroundColor: '#0066FF' }} />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </section>

            {/* Reset */}
            <section>
              <button
                type="button"
                onClick={resetCustomization}
                className="w-full py-2.5 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Reset customization
              </button>
            </section>

            <p className="text-xs text-gray-400">Switch to Customize for header and form details.</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {/* Collapsible Header */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setCustomizeOpen(customizeOpen === 'header' ? null : 'header')}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100"
              >
                Header
                <span className="text-gray-500">{customizeOpen === 'header' ? '▼' : '▶'}</span>
              </button>
              {customizeOpen === 'header' && (
                <div className="border-t border-gray-200 bg-white">
                  <HeaderCustomization
                    headerConfig={headerConfig}
                    onHeaderChange={onHeaderChange}
                    customization={customization}
                    onCustomizationChange={onCustomizationChange}
                  />
                </div>
              )}
            </div>

            {/* Collapsible Rest of form */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setCustomizeOpen(customizeOpen === 'body' ? null : 'body')}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100"
              >
                Rest of form
                <span className="text-gray-500">{customizeOpen === 'body' ? '▼' : '▶'}</span>
              </button>
              {customizeOpen === 'body' && (
                <div className="border-t border-gray-200 bg-white">
                  <BodyCustomization customization={customization} update={update} />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={resetCustomization}
              className="w-full mt-2 py-2 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              Reset customization
            </button>
          </div>
        )}
      </div>
    </Wrapper>
  )
}

/**
 * Header Customization Section
 */
function HeaderCustomization({ 
  headerConfig, 
  onHeaderChange,
  customization,
  onCustomizationChange
}: { 
  headerConfig: FormHeaderConfig
  onHeaderChange: (config: FormHeaderConfig) => void
  customization: FormCustomization
  onCustomizationChange: (customization: FormCustomization) => void
}) {
  return (
    <div className="p-4 space-y-6">
      {/* Logo, Title, Subtext */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Content</h3>
        <FormHeaderSection config={headerConfig} onChange={onHeaderChange} />
      </section>

      {/* Header Colors */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Colors</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.headerBackgroundColor || '#f7f9fc'}
                onChange={(e) => onCustomizationChange({ ...customization, headerBackgroundColor: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded border border-gray-200"
              />
              <input
                type="text"
                value={customization.headerBackgroundColor || '#f7f9fc'}
                onChange={(e) => onCustomizationChange({ ...customization, headerBackgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.headerTextColor || '#0F1419'}
                onChange={(e) => onCustomizationChange({ ...customization, headerTextColor: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded border border-gray-200"
              />
              <input
                type="text"
                value={customization.headerTextColor || '#0F1419'}
                onChange={(e) => onCustomizationChange({ ...customization, headerTextColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * Body/Form Customization Section
 */
function BodyCustomization({ 
  customization, 
  update 
}: { 
  customization: FormCustomization
  update: (key: keyof FormCustomization, value: string | undefined) => void
}) {
  return (
    <div className="p-4 space-y-6">
      {/* Typography */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Typography</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={customization.fontFamily ?? ''}
              onChange={(e) => update('fontFamily', e.target.value || undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value || 'default'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Header Font Size
            </label>
            <select
              value={customization.headerFontSize ?? '1.5rem'}
              onChange={(e) => update('headerFontSize', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1.25rem">Small</option>
              <option value="1.5rem">Medium</option>
              <option value="1.875rem">Large</option>
              <option value="2.25rem">X-Large</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Body Font Size
            </label>
            <select
              value={customization.bodyFontSize ?? '1rem'}
              onChange={(e) => update('bodyFontSize', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="0.875rem">Small</option>
              <option value="1rem">Medium</option>
              <option value="1.125rem">Large</option>
            </select>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Colors</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Page Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.backgroundColor || '#f7f9fc'}
                onChange={(e) => update('backgroundColor', e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-200"
              />
              <input
                type="text"
                value={customization.backgroundColor || '#f7f9fc'}
                onChange={(e) => update('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Form Background
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.formBackgroundColor || '#ffffff'}
                onChange={(e) => update('formBackgroundColor', e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-200"
              />
              <input
                type="text"
                value={customization.formBackgroundColor || '#ffffff'}
                onChange={(e) => update('formBackgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Primary Color (Buttons, Links)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.primaryColor || '#0066FF'}
                onChange={(e) => update('primaryColor', e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-200"
              />
              <input
                type="text"
                value={customization.primaryColor || '#0066FF'}
                onChange={(e) => update('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.textColor || '#0F1419'}
                onChange={(e) => update('textColor', e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-200"
              />
              <input
                type="text"
                value={customization.textColor || '#0F1419'}
                onChange={(e) => update('textColor', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Field Border Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customization.fieldBorderColor || '#D1D5DB'}
                onChange={(e) => update('fieldBorderColor', e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-200"
              />
              <input
                type="text"
                value={customization.fieldBorderColor || '#D1D5DB'}
                onChange={(e) => update('fieldBorderColor', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Style */}
      <section>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Style</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Border Radius
          </label>
          <select
            value={customization.borderRadius ?? '0.5rem'}
            onChange={(e) => update('borderRadius', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="0">Sharp (0px)</option>
            <option value="0.25rem">Slight (4px)</option>
            <option value="0.5rem">Rounded (8px)</option>
            <option value="0.75rem">More Rounded (12px)</option>
            <option value="1rem">Very Rounded (16px)</option>
            <option value="9999px">Pill</option>
          </select>
        </div>
      </section>
    </div>
  )
}
