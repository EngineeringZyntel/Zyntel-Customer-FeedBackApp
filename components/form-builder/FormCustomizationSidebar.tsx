'use client'

import { FormHeaderSection, type FormHeaderConfig } from './FormHeaderSection'

export interface FormCustomization {
  backgroundColor?: string
  primaryColor?: string
  headerBackgroundColor?: string
  headerTextColor?: string
  fontFamily?: string
  headerFontSize?: string
  bodyFontSize?: string
  textColor?: string
  borderRadius?: string
}

interface FormCustomizationSidebarProps {
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
  { value: "'Courier New', monospace", label: 'Courier New' },
]

export function FormCustomizationSidebar({
  headerConfig,
  customization,
  onHeaderChange,
  onCustomizationChange,
}: FormCustomizationSidebarProps) {
  const update = (key: keyof FormCustomization, value: string | undefined) => {
    onCustomizationChange({ ...customization, [key]: value })
  }

  return (
    <aside className="w-80 shrink-0 border-l border-gray-200 bg-white">
      <div className="sticky top-4 space-y-6 overflow-y-auto p-4">
        {/* Header section */}
        <section className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <FormHeaderSection config={headerConfig} onChange={onHeaderChange} />
        </section>

        {/* Typography */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Typography</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Font family</label>
              <select
                value={customization.fontFamily ?? ''}
                onChange={(e) => update('fontFamily', e.target.value || undefined)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {FONT_OPTIONS.map((opt) => (
                  <option key={opt.value || 'default'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Header font size</label>
              <select
                value={customization.headerFontSize ?? '1.5rem'}
                onChange={(e) => update('headerFontSize', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="1.25rem">Small</option>
                <option value="1.5rem">Medium</option>
                <option value="1.875rem">Large</option>
                <option value="2.25rem">X-Large</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Body font size</label>
              <select
                value={customization.bodyFontSize ?? '1rem'}
                onChange={(e) => update('bodyFontSize', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Colors</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Form background</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.backgroundColor || '#ffffff'}
                  onChange={(e) => update('backgroundColor', e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-200"
                />
                <input
                  type="text"
                  value={customization.backgroundColor || '#ffffff'}
                  onChange={(e) => update('backgroundColor', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Primary color (buttons, links)</label>
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
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Text color</label>
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
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Style */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Style</h3>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Border radius</label>
            <select
              value={customization.borderRadius ?? '0.5rem'}
              onChange={(e) => update('borderRadius', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="0">Sharp</option>
              <option value="0.25rem">Slight</option>
              <option value="0.5rem">Rounded</option>
              <option value="0.75rem">More rounded</option>
              <option value="9999px">Pill</option>
            </select>
          </div>
        </section>
      </div>
    </aside>
  )
}
