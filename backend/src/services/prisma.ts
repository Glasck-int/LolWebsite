import { PrismaClient } from '../generated/prisma'

/**
 * Prisma client instance
 *
 * Centralized database client for the entire application
 * Handles connection management and graceful shutdown
 */
const prisma = new PrismaClient()

process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
})

process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
})

export default prisma
