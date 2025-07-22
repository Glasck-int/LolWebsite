import { Team as TeamType } from '@/generated/prisma'
import { apiRequest, ApiResponse } from './utils'
import { MatchSchedule as MatchScheduleType } from '@/generated/prisma'
import { MatchScheduleGame as MatchScheduleGameType } from '@/generated/prisma'

/**
 * Team recent matches response structure
 */
export interface TeamRecentMatchesResponse {
    team: string
    tournament: string
    recentMatches: MatchScheduleType[]
    form: string // String like "WWLLW" representing last 5 matches
}

/**
 * Get a team by name
 *
 * @param name - The name of the team to fetch
 * @returns Promise with team data or error
 */
async function getTeamByName(name: string): Promise<ApiResponse<TeamType>> {
    return apiRequest<TeamType>(`/api/teams/name/${encodeURIComponent(name)}`)
}

/**
 * Get multiple teams by their names
 *
 * @param names - Array of team names to fetch
 * @returns Promise with array of team data or error
 */
async function getTeamsByNames(
    names: string[]
): Promise<ApiResponse<TeamType[]>> {
    const teamPromises = names.map((name) => getTeamByName(name))
    const results = await Promise.allSettled(teamPromises)

    const teams: TeamType[] = []
    const errors: string[] = []

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
            teams.push(result.value.data)
        } else {
            errors.push(`Failed to fetch team: ${names[index]}`)
        }
    })

    if (teams.length === 0 && errors.length > 0) {
        return { error: errors.join(', ') }
    }

    return { data: teams }
}

/**
 * Get the 5 most recent matches for a team in a specific tournament with win/loss status
 *
 * @param name - The name of the team to fetch recent matches for
 * @param tournament - The tournament name to filter matches by
 * @returns Promise with recent matches data including form string
 */
async function getTeamRecentMatches(
    name: string,
    tournament: string
): Promise<ApiResponse<TeamRecentMatchesResponse>> {
    return apiRequest<TeamRecentMatchesResponse>(
        `/api/teams/name/${encodeURIComponent(
            name
        )}/tournament/${encodeURIComponent(tournament)}/recent-matches`
    )
}

/**
 * Get recent matches for multiple teams in a specific tournament
 *
 * @param names - Array of team names to fetch recent matches for
 * @param tournament - The tournament name to filter matches by
 * @returns Promise with array of recent matches data or error
 */
async function getTeamsRecentMatches(
    names: string[],
    tournament: string
): Promise<ApiResponse<TeamRecentMatchesResponse[]>> {
    const matchPromises = names.map((name) =>
        getTeamRecentMatches(name, tournament)
    )
    const results = await Promise.allSettled(matchPromises)

    const matches: TeamRecentMatchesResponse[] = []
    const errors: string[] = []

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
            // console.log(result.value.data.recentMatches[0].team1 + 'yes')
            matches.push(result.value.data)
        } else {
            errors.push(
                `Failed to fetch recent matches for team: ${names[index]}`
            )
        }
    })

    if (matches.length === 0 && errors.length > 0) {
        return { error: errors.join(', ') }
    }
    return { data: matches }
}

/**
 * Team recent games response structure
 */
export interface TeamRecentGamesResponse {
    team: string
    tournament: string
    recentGames: MatchScheduleGameType[]
    form: string // String like "WWLLW" representing last 5 games
}

/**
 * Get the 5 most recent games for a team in a specific tournament with win/loss status
 *
 * @param name - The name of the team to fetch recent games for
 * @param tournament - The tournament name to filter games by
 * @returns Promise with recent games data including form string
 */
async function getTeamRecentGames(
    name: string,
    tournament: string
): Promise<ApiResponse<TeamRecentGamesResponse>> {
    return apiRequest<TeamRecentGamesResponse>(
        `/api/teams/name/${encodeURIComponent(
            name
        )}/tournament/${encodeURIComponent(tournament)}/recent-games`
    )
}

/**
 * Get recent games for multiple teams in a specific tournament
 *
 * @param names - Array of team names to fetch recent games for
 * @param tournament - The tournament name to filter games by
 * @returns Promise with array of recent games data or error
 */
async function getTeamsRecentGames(
    names: string[],
    tournament: string
): Promise<ApiResponse<TeamRecentGamesResponse[]>> {
    const gamePromises = names.map((name) =>
        getTeamRecentGames(name, tournament)
    )
    const results = await Promise.allSettled(gamePromises)

    const games: TeamRecentGamesResponse[] = []
    const errors: string[] = []

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
            games.push(result.value.data)
        } else {
            errors.push(
                `Failed to fetch recent games for team: ${names[index]}`
            )
        }
    })

    if (games.length === 0 && errors.length > 0) {
        return { error: errors.join(', ') }
    }
    return { data: games }
}

export {
    getTeamByName,
    getTeamsByNames,
    getTeamRecentMatches,
    getTeamsRecentMatches,
    getTeamRecentGames,
    getTeamsRecentGames,
}
