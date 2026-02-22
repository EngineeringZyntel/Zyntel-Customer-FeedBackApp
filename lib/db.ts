/**
 * Database Connection Utility
 *
 * Configured for Neon PostgreSQL on Render with:
 * - Connection retry for cold starts
 * - Singleton pattern to prevent multiple instances
 * - Graceful shutdown
 *
 * IMPORTANT: Use Neon's pooled connection string (hostname contains -pooler)
 * for serverless/Render to avoid "Error kind Closed" and connection limits.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Connect with retry (for Neon cold starts / scale-to-zero)
 */
export async function connectWithRetry(maxRetries = 5): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect()
      console.log('✅ Database connected successfully')
      return
    } catch (error) {
      console.warn(`Database connection attempt ${attempt}/${maxRetries} failed:`, error)
      if (attempt === maxRetries) {
        console.error('❌ Database connection failed after retries')
        throw error
      }
      const delay = 1000 * attempt
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

/**
 * Initialize database connection (call on startup)
 */
export async function connectDB(): Promise<void> {
  await connectWithRetry()
}

/**
 * Disconnect database (cleanup)
 */
export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect()
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
