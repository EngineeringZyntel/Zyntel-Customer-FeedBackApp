/**
 * Authentication Utilities
 * 
 * Handles password hashing, JWT tokens, and authentication logic
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret === 'your-secret-key-change-in-production') {
    throw new Error('JWT_SECRET must be set to a strong random value (e.g. openssl rand -base64 32)')
  }
  return secret
}

export interface TokenPayload {
  userId: number
  email: string
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload
  } catch (error) {
    return null
  }
}

/**
 * Get user from request headers (for API routes)
 */
export function getUserFromRequest(request: Request): TokenPayload | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const token = authHeader.substring(7)
  return verifyToken(token)
}

