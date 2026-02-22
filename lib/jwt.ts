/**
 * JWT Decoder (Client-side)
 * 
 * Simple JWT decoder for client-side use
 * Note: This doesn't verify the signature - only decodes the payload
 * For production, consider using a proper JWT library or decode on server
 */

export interface JWTPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    
    return decoded as JWTPayload
  } catch (error) {
    return null
  }
}

export function getCurrentUser(): JWTPayload | null {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('token')
  if (!token) return null
  
  return decodeJWT(token)
}

