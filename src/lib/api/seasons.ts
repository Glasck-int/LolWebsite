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

export {
    getSeasonsByLeagueId
}