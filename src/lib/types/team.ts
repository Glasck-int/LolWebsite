import { Team as PrismaTeam } from '@/generated/prisma'

/**
 * Extended Team type that includes the latest league information
 * This extends the base Prisma Team type with additional API fields
 */
export interface TeamWithLatestLeague extends PrismaTeam {
    latestLeague?: {
        id: number
        name: string
        short: string
        region: string
        level: string
        isOfficial: boolean
        isMajor: boolean
    }
}

export type { PrismaTeam as Team }