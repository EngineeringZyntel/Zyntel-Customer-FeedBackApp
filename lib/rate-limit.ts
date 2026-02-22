/**
 * Rate Limiting for Form Submissions
 * In-memory rate limiter (for production, use Redis/Upstash)
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (will reset on server restart)
// For production, use Redis or Upstash
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 60 * 1000)

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute default
): Promise<RateLimitResult> {
  const now = Date.now()
  const key = `ratelimit:${identifier}`
  
  let entry = rateLimitStore.get(key)
  
  // If no entry or expired, create new
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, entry)
  }
  
  // Increment count
  entry.count++
  
  // Check if over limit
  const success = entry.count <= limit
  const remaining = Math.max(0, limit - entry.count)
  
  return {
    success,
    limit,
    remaining,
    reset: entry.resetTime,
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

/**
 * Rate limit specifically for form submissions
 */
export async function rateLimitFormSubmission(ipAddress: string): Promise<RateLimitResult> {
  // 10 submissions per 10 minutes per IP
  return checkRateLimit(`form-submit:${ipAddress}`, 10, 10 * 60 * 1000)
}
