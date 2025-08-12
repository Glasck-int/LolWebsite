import { Team as PrismaTeam, League as PrismaLeague } from '@/generated/prisma'

/**
 * Extended Team type that includes the latest league information
 * This extends the base Prisma Team type with additional API fields
 */
export interface TeamWithLatestLeague extends PrismaTeam {
    latestLeague?: PrismaLeague
}

export type { PrismaTeam as Team }