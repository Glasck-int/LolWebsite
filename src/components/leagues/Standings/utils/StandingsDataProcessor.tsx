import {
    Standings as StandingsType,
    MatchScheduleGame as MatchScheduleGameType,
    Team,
} from '@/generated/prisma'
import {
    TeamRecentMatchesResponse,
    TeamRecentGamesResponse,
} from '@/lib/api/teams'

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
    /** Number of games won */
    wins: number
    /** Number of games lost */
    losses: number
    /** Total number of matches played (wins + losses) */
    totalMatches: number
    /** Calculated match win rate percentage */
    matchWinRate: number
    /** Games statistics for this team */
    gamesStats: {
        totalGames: number
        wins: number
        losses: number
        winRate: number
        form: string
        recentGames: MatchScheduleGameType[]
    }
    /** Group information if the team is in a group */
    groupInfo?: {
        groupName: string
        groupDisplay?: string
        groupN?: number
    }
}

/**
 * Interface for processed games data with team statistics.
 *
 * Contains aggregated game statistics for each team including wins, losses,
 * and calculated win rate for individual games.
 */
export interface ProcessedGameStats {
    /** Team name */
    team: string
    /** Additional team information if available */
    teamData?: Team
    /** URL of the team's logo image */
    teamImage: string
    /** Total number of games played */
    totalGames: number
    /** Number of games won */
    wins: number
    /** Number of games lost */
    losses: number
    /** Calculated win rate percentage */
    winRate: number
}

/**
 * Processes raw standings data to include additional team information and calculations.
 *
 * Enriches raw standings data by fetching team information, images, recent matches,
 * and calculated statistics like total games and win rate percentage.
 * Also processes games data to include games statistics for each team.
 * Filters out standings without team information.
 *
 * @param standings - Array of raw standings data from the database
 * @param teamsData - Array of team data fetched from the API
 * @param teamsImages - Object mapping team names to image URLs
 * @param teamsRecentMatches - Array of recent matches data for teams
 * @param games - Array of games data for calculating games statistics
 * @returns An array of processed standings data, ready for rendering
 *
 * @example
 * ```ts
 * const processedData = processStandingsData(
 *   rawStandings,
 *   teamsData,
 *   teamsImages,
 *   recentMatches,
 *   games
 * )
 *
 * // processedData contains enriched standings with team info, calculated stats, and games stats
 * ```
 *
 * @remarks
 * This function performs several operations:
 * - Matches standings with team data using team names
 * - Calculates total matches and match win rate for each team
 * - Associates team images and recent matches data
 * - Processes games data to calculate games statistics for each team
 * - Filters out invalid standings entries
 *
 * @see ProcessedStanding
 */
export const processStandingsData = (
    standings: StandingsType[],
    teamsData: Team[],
    teamsImages: Record<string, string>,
    teamsRecentMatches: TeamRecentMatchesResponse[],
    gamesRecentResponse: TeamRecentGamesResponse[],
    games?: MatchScheduleGameType[]
): ProcessedStanding[] => {
    // Calculate games statistics for all teams
    const teamGamesStats: Record<string, { wins: number; losses: number }> = {}

    for (const game of games || []) {
        if (!game.blue || !game.red) continue

        if (!teamGamesStats[game.blue]) {
            teamGamesStats[game.blue] = { wins: 0, losses: 0 }
        }
        if (!teamGamesStats[game.red]) {
            teamGamesStats[game.red] = { wins: 0, losses: 0 }
        }

        if (game.winner === 1) {
            teamGamesStats[game.blue].wins++
            teamGamesStats[game.red].losses++
        } else if (game.winner === 2) {
            teamGamesStats[game.red].wins++
            teamGamesStats[game.blue].losses++
        }
    }

    const processedStandings: ProcessedStanding[] = []

    for (const standing of standings) {
        if (!standing.team) continue

        const teamData = teamsData.find((t) => t.overviewPage === standing.team)
        const teamImage = teamsImages[standing.team] || ''
        const teamRecentMatchesData = teamsRecentMatches.find(
            (m) => m.team === standing.team
        )
        const gamesRecent = gamesRecentResponse.find(
            (response) => response.team === standing.team
        )

        // Use the form from the API response
        const form = gamesRecent?.form || ''

        const totalMatches =
            (standing.winSeries || 0) + (standing.lossSeries || 0)
        // Calculate match statistics (from standings data)
        const matchWinRate =
            totalMatches > 0
                ? Math.round(((standing.winSeries || 0) / totalMatches) * 100)
                : 0

        // Get games statistics for this team
        const gamesStats = teamGamesStats[standing.team] || {
            wins: 0,
            losses: 0,
        }

        // const gameStats = processGamesData(games || [], teamsData, teamsImages)
        const gamesTotalGames = gamesStats.wins + gamesStats.losses
        const gamesWinRate =
            gamesTotalGames > 0
                ? Math.round((gamesStats.wins / gamesTotalGames) * 100)
                : 0

        // Extract group information from team data
        // Check if standing.Team includes TournamentGroups (from API include)
        const standingTeam = (standing as any).Team
        const tournamentGroups = standingTeam?.TournamentGroups
        const groupInfo = tournamentGroups?.[0] ? {
            groupName: tournamentGroups[0].groupName,
            groupDisplay: tournamentGroups[0].groupDisplay || undefined,
            groupN: tournamentGroups[0].groupN || undefined
        } : undefined

        processedStandings.push({
            standing,
            teamData,
            teamImage,
            teamsRecentMatches: teamRecentMatchesData,
            totalMatches,
            wins: standing.winSeries || 0,
            losses: standing.lossSeries || 0,
            matchWinRate,
            gamesStats: {
                totalGames: gamesTotalGames,
                wins: gamesStats.wins,
                losses: gamesStats.losses,
                winRate: gamesWinRate,
                recentGames: gamesRecent?.recentGames || [],
                form: form,
            },
            groupInfo,
        })
    }

    return processedStandings
}

/**
 * Processes games data to calculate team statistics for individual games.
 *
 * Aggregates game results for each team to calculate wins, losses, and win rate
 * for individual games (not matches). Associates team data and images.
 *
 * @param games - Array of game data from the database
 * @param teamsData - Array of team data fetched from the API
 * @param teamsImages - Object mapping team names to image URLs
 * @returns An array of processed game statistics data, ready for rendering
 *
 * @example
 * ```ts
 * const processedGameStats = processGamesData(
 *   games,
 *   teamsData,
 *   teamsImages
 * )
 *
 * // processedGameStats contains team statistics for individual games
 * ```
 *
 * @remarks
 * This function performs several operations:
 * - Aggregates game results for each team
 * - Calculates total games, wins, losses, and win rate
 * - Associates team data and images
 * - Handles both blue and red team sides in games
 *
 * @see ProcessedGameStats
 */
export const processGamesData = (
    games: MatchScheduleGameType[],
    teamsData: Team[],
    teamsImages: Record<string, string>
): ProcessedGameStats[] => {
    const teamStats: Record<string, { wins: number; losses: number }> = {}

    // Aggregate game results for each team
    for (const game of games) {
        if (!game.blue || !game.red) continue

        // Initialize team stats if not exists
        if (!teamStats[game.blue]) {
            teamStats[game.blue] = { wins: 0, losses: 0 }
        }
        if (!teamStats[game.red]) {
            teamStats[game.red] = { wins: 0, losses: 0 }
        }

        // Determine winner based on winner field (1 = blue wins, 2 = red wins)
        if (game.winner === 1) {
            teamStats[game.blue].wins++
            teamStats[game.red].losses++
        } else if (game.winner === 2) {
            teamStats[game.red].wins++
            teamStats[game.blue].losses++
        }
    }

    // Convert to ProcessedGameStats array
    const processedGameStats: ProcessedGameStats[] = []

    for (const [teamName, stats] of Object.entries(teamStats)) {
        const teamData = teamsData.find((t) => t.overviewPage === teamName)
        const teamImage = teamsImages[teamName] || ''
        const totalGames = stats.wins + stats.losses
        const winRate =
            totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0

        processedGameStats.push({
            team: teamName,
            teamData,
            teamImage,
            totalGames,
            wins: stats.wins,
            losses: stats.losses,
            winRate,
        })
    }

    return processedGameStats
}

/**
 * Groups processed standings data by group information.
 * 
 * @param processedData - Array of processed standings data
 * @returns Object with grouped standings or null if no groups exist
 */
export const groupStandingsData = (processedData: ProcessedStanding[]) => {
    // Check if any teams have group information
    const hasGroups = processedData.some(team => team.groupInfo)
    
    if (!hasGroups) {
        return null
    }
    
    // Group teams by group name
    const groupedData: Record<string, ProcessedStanding[]> = {}
    
    processedData.forEach(team => {
        if (team.groupInfo) {
            const groupKey = team.groupInfo.groupName
            if (!groupedData[groupKey]) {
                groupedData[groupKey] = []
            }
            groupedData[groupKey].push(team)
        } else {
            // Teams without group go to "Ungrouped"
            if (!groupedData['Ungrouped']) {
                groupedData['Ungrouped'] = []
            }
            groupedData['Ungrouped'].push(team)
        }
    })
    
    // Sort groups by group number if available, otherwise alphabetically
    const sortedGroups = Object.entries(groupedData).sort(([a, teamsA], [b, teamsB]) => {
        const groupANumber = teamsA[0]?.groupInfo?.groupN
        const groupBNumber = teamsB[0]?.groupInfo?.groupN
        
        if (groupANumber !== undefined && groupBNumber !== undefined) {
            return groupANumber - groupBNumber
        }
        
        // If no group numbers, sort alphabetically but put "Ungrouped" last
        if (a === 'Ungrouped') return 1
        if (b === 'Ungrouped') return -1
        return a.localeCompare(b)
    })
    
    return Object.fromEntries(sortedGroups)
}
