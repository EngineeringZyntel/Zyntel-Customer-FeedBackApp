/**
 * Input sanitization for form responses
 * Strips HTML/script tags to prevent XSS
 */

import DOMPurify from 'isomorphic-dompurify'

export function sanitizeResponseData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      })
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) =>
        typeof v === 'string'
          ? DOMPurify.sanitize(v, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
          : v
      )
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}
