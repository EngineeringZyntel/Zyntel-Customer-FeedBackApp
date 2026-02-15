/**
 * Form Builder Right Sidebar
 * Contains Header and Body customization options
 */

'use client'

import { useState } from 'react'
import { FormHeaderSection, type FormHeaderConfig } from './FormHeaderSection'
import { cn } from '@/lib/utils'

export interface FormCustomization {
  // Header
  headerBackgroundColor?: string
  headerTextColor?: string
  
  // Body/Form
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

interface FormBuilderRightSidebarProps {
  headerConfig: FormHeaderConfig
  customization: FormCustomization
  onHeaderChange: (config: FormHeaderConfig) => void
  onCustomizationChange: (customization: FormCustomization) => void
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
}: FormBuilderRightSidebarProps) {
  const [activeSection, setActiveSection] = useState<'header' | 'body'>('header')

  const update = (key: keyof FormCustomization, value: string | undefined) => {
    onCustomizationChange({ ...customization, [key]: value })
  }

  return (
    <aside className="w-80 h-screen bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Customize</h2>
        <p className="text-xs text-gray-500 mt-1">Style your form appearance</p>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSection('header')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            activeSection === 'header'
              ? 'text-primary bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          Header
          {activeSection === 'header' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveSection('body')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
            activeSection === 'body'
              ? 'text-primary bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          Rest of form
          {activeSection === 'body' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'header' ? (
          <HeaderCustomization 
            headerConfig={headerConfig} 
            onHeaderChange={onHeaderChange}
            customization={customization}
            onCustomizationChange={onCustomizationChange}
          />
        ) : (
          <BodyCustomization 
            customization={customization} 
            update={update} 
          />
        )}
      </div>
    </aside>
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
