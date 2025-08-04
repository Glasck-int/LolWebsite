import prisma from '../services/prisma'

export interface TournamentIdentifier {
    id?: number
    name?: string
    overviewPage?: string
}

/**
 * Resolves a tournament identifier (ID or name) to tournament details
 * @param identifier - Can be a numeric ID or string name
 * @returns Tournament details or null if not found
 */
export async function resolveTournament(identifier: string): Promise<TournamentIdentifier | null> {
    // Check if the identifier is a numeric ID
    const numericId = parseInt(identifier, 10)
    
    if (!isNaN(numericId)) {
        // It's a numeric ID
        const tournament = await prisma.tournament.findUnique({
            where: { id: numericId },
            select: {
                id: true,
                name: true,
                overviewPage: true
            }
        })
        
        return tournament
    }
    
    // It's a string name - try to find by name or overview page
    const tournament = await prisma.tournament.findFirst({
        where: {
            OR: [
                { name: identifier },
                { overviewPage: identifier },
                { standardName: identifier }
            ]
        },
        select: {
            id: true,
            name: true,
            overviewPage: true
        }
    })
    
    return tournament
}

/**
 * Gets tournament conditions for database queries
 * @param identifier - Tournament ID or name
 * @returns Database query conditions
 */
export async function getTournamentConditions(identifier: string): Promise<any[]> {
    const tournament = await resolveTournament(identifier)
    
    if (!tournament) {
        // Return conditions that will match the original identifier
        // This maintains backward compatibility
        return [
            { tournament: identifier },
            { overviewPage: { contains: identifier } }
        ]
    }
    
    // Build conditions based on resolved tournament
    const conditions: any[] = []
    
    if (tournament.name) {
        conditions.push({ tournament: tournament.name })
    }
    
    if (tournament.overviewPage) {
        conditions.push({ overviewPage: { contains: tournament.overviewPage } })
    }
    
    // Also try with the original identifier for backward compatibility
    if (tournament.name !== identifier) {
        conditions.push({ tournament: identifier })
    }
    
    return conditions
}