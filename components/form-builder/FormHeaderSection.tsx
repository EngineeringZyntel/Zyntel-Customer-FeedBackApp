'use client'

export interface FormHeaderConfig {
  logoData?: string | null
  headerTitle: string
  headerSubtext?: string
  headerBackgroundColor?: string
}

interface FormHeaderSectionProps {
  config: FormHeaderConfig
  onChange: (config: FormHeaderConfig) => void
}

export function FormHeaderSection({ config, onChange }: FormHeaderSectionProps) {
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange({ ...config, logoData: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    onChange({ ...config, logoData: null })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Header section</h3>
      <p className="text-xs text-gray-500">
        Configure the title area at the top of your form
      </p>

      {/* Logo */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Logo</label>
        {config.logoData ? (
          <div className="flex items-center gap-3">
            <img
              src={config.logoData}
              alt="Logo"
              className="h-16 w-auto max-w-[120px] object-contain rounded border border-gray-200 bg-white p-2"
            />
            <div className="flex gap-2">
              <label className="cursor-pointer rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                Change
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              <button
                type="button"
                onClick={removeLogo}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-6 text-gray-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary">
            <span className="text-2xl">📷</span>
            <span className="mt-1 text-xs font-medium">Upload logo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </label>
        )}
      </div>

      {/* Header title */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Header title</label>
        <input
          type="text"
          value={config.headerTitle}
          onChange={(e) => onChange({ ...config, headerTitle: e.target.value })}
          placeholder="Form title"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Subtext */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Subtext</label>
        <textarea
          value={config.headerSubtext ?? ''}
          onChange={(e) => onChange({ ...config, headerSubtext: e.target.value })}
          placeholder="Brief description or instructions"
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Header background */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Header background color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={config.headerBackgroundColor || '#f7f9fc'}
            onChange={(e) => onChange({ ...config, headerBackgroundColor: e.target.value })}
            className="h-10 w-14 cursor-pointer rounded border border-gray-200"
          />
          <input
            type="text"
            value={config.headerBackgroundColor || '#f7f9fc'}
            onChange={(e) => onChange({ ...config, headerBackgroundColor: e.target.value })}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  )
}
