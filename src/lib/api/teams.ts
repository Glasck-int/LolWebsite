import { Team as TeamType } from '../../../backend/src/generated/prisma'
import { getApiBaseUrl, apiRequest, ApiResponse } from './utils'
import { MatchSchedule as MatchScheduleType } from '../../../backend/src/generated/prisma'

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

export {
    getTeamByName,
    getTeamsByNames,
    getTeamRecentMatches,
    getTeamsRecentMatches,
}
