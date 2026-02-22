/**
 * Environment variable validation
 * Fails fast on startup if required vars are missing (production).
 */

export function validateEnv(): void {
  const required = ['DATABASE_URL', 'JWT_SECRET'] as const
  const missing: string[] = []

  for (const key of required) {
    const val = process.env[key]
    if (!val || (key === 'JWT_SECRET' && val === 'your-secret-key-change-in-production')) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    console.error(
      '❌ Missing or invalid environment variables:',
      missing.join(', ')
    )
    if (missing.includes('JWT_SECRET')) {
      console.error(
        '   JWT_SECRET must be set to a strong random value (e.g. openssl rand -base64 32)'
      )
    }
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
