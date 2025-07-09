import {
    Standings as StandingsType,
    Team,
} from '../../../../backend/src/generated/prisma'
import { TeamRecentMatchesResponse } from '@/lib/api/teams'

/**
 * Interface for processed standings data with additional team information.
 *
 * Contains enriched standings data with team details, images, recent matches,
 * and calculated statistics like win rate and total games.
 */
export interface ProcessedStanding {
    /** Raw standings data from the database */
    standing: StandingsType
    /** Additional team information if available */
    teamData?: Team
    /** URL of the team's logo image */
    teamImage: string
    /** Recent matches data for form calculation */
    teamsRecentMatches?: TeamRecentMatchesResponse
    /** Total number of games played (wins + losses) */
    totalGames: number
    /** Calculated win rate percentage */
    winRate: number
}

/**
 * Processes raw standings data to include additional team information and calculations.
 *
 * Enriches raw standings data by fetching team information, images, and recent matches.
 * Calculates derived statistics like total games played and win rate percentage.
 * Filters out standings without team information.
 *
 * @param standings - Array of raw standings data from the database
 * @param teamsData - Array of team data fetched from the API
 * @param teamsImages - Object mapping team names to image URLs
 * @param teamsRecentMatches - Array of recent matches data for teams
 * @returns An array of processed standings data, ready for rendering
 *
 * @example
 * ```ts
 * const processedData = processStandingsData(
 *   rawStandings,
 *   teamsData,
 *   teamsImages,
 *   recentMatches
 * )
 *
 * // processedData contains enriched standings with team info and calculated stats
 * ```
 *
 * @remarks
 * This function performs several operations:
 * - Matches standings with team data using team names
 * - Calculates total games and win rate for each team
 * - Associates team images and recent matches data
 * - Filters out invalid standings entries
 *
 * @see ProcessedStanding
 */
export const processStandingsData = (
    standings: StandingsType[],
    teamsData: Team[],
    teamsImages: Record<string, string>,
    teamsRecentMatches: TeamRecentMatchesResponse[]
): ProcessedStanding[] => {
    const processedStandings: ProcessedStanding[] = []

    for (const standing of standings) {
        if (!standing.team) continue

        const teamData = teamsData.find((t) => t.overviewPage === standing.team)
        const teamImage = teamsImages[standing.team] || ''
        const teamRecentMatchesData = teamsRecentMatches.find(
            (m) => m.team === standing.team
        )

        const totalGames = (standing.winGames || 0) + (standing.lossGames || 0)
        const winRate =
            totalGames > 0
                ? Math.round(((standing.winGames || 0) / totalGames) * 100)
                : 0

        processedStandings.push({
            standing,
            teamData,
            teamImage,
            teamsRecentMatches: teamRecentMatchesData,
            totalGames,
            winRate,
        })
    }

    return processedStandings
}
