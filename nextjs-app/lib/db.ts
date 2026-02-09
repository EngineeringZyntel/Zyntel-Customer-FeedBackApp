/**
 * Database Connection Utility
 * 
 * This file sets up Prisma Client for database access.
 * Prisma provides type-safe database queries and connection pooling.
 */

import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Initialize database connection
 * Call this on app startup to ensure connection is ready
 */
export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

/**
 * Disconnect database (useful for cleanup)
 */
export async function disconnectDB() {
  await prisma.$disconnect()
}

