import { apiRequest, ApiResponse } from './utils'
import { SeasonResponse } from '@glasck-int/glasck-types'



/**
 * Get seasons, splits, and tournaments data for a league by ID
 * Formatted for use with TableEntityLayout component
 *
 * @param leagueId - The ID of the league to fetch seasons for
 * @returns Promise with array of seasons or error
 */
async function getSeasonsByLeagueId(leagueId: number): Promise<ApiResponse<SeasonResponse[]>> {
    return apiRequest<SeasonResponse[]>(`/api/seasons/league/${leagueId}`)
}

/**
 * Get seasons, splits, and tournaments data for a player by name
 * Formatted for use with TableEntityLayout component
 *
 * @param playerName - The name of the player to fetch seasons for
 * @returns Promise with array of seasons or error
 */
async function getSeasonsByPlayerName(playerName: string): Promise<ApiResponse<SeasonResponse[]>> {
    const encodedPlayerName = encodeURIComponent(playerName)
    return apiRequest<SeasonResponse[]>(`/api/seasons/player/${encodedPlayerName}`)
}

/**
 * Get seasons, splits, and tournaments data for a team by name
 * Formatted for use with TableEntityLayout component
 *
 * @param teamName - The name of the team to fetch seasons for
 * @returns Promise with array of seasons or error
 */
async function getSeasonsByTeamName(teamName: string): Promise<ApiResponse<SeasonResponse[]>> {
    const encodedTeamName = encodeURIComponent(teamName)
    return apiRequest<SeasonResponse[]>(`/api/seasons/team/${encodedTeamName}`)
}

export {
    getSeasonsByLeagueId,
    getSeasonsByPlayerName,
    getSeasonsByTeamName
}