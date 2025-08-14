import prisma from '../services/prisma'
import type { Team } from '../generated/prisma'

/**
 * Team resolution result containing the resolved team information
 */
export interface TeamResolution {
    /** The canonical overview page identifier for the team */
    overviewPage: string
    /** All redirect names that point to this team (just the team name itself) */
    redirectNames: string[]
    /** The full Team object (if requested) */
    team?: Team
}

/**
 * Custom error for team not found scenarios
 */
export class TeamNotFoundError extends Error {
    constructor(teamName: string) {
        super(`Team not found: ${teamName}`)
        this.name = 'TeamNotFoundError'
    }
}

/**
 * Resolves a team name to the canonical team information
 * Teams don't have redirects like players, so this simply finds the team by name
 * 
 * @param teamName - The team name to resolve
 * @returns Promise<TeamResolution> - The resolved team information
 * @throws TeamNotFoundError - If the team cannot be found
 */
export async function resolveTeam(teamName: string): Promise<TeamResolution> {
    // Find the team by name directly
    const team = await prisma.team.findFirst({
        where: { 
            name: {
                equals: teamName,
            }
        }
    })

    if (!team) {
        throw new TeamNotFoundError(teamName)
    }

    // For teams, overviewPage is the name and redirectNames is just the name
    const result: TeamResolution = {
        overviewPage: team.overviewPage || team.name,
        redirectNames: [team.name],
        team: team
    }

    return result
}