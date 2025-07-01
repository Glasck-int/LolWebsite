import { Tournament as TournamentType } from '../../../backend/src/generated/prisma'
import { apiRequest, ApiResponse } from './utils'

/**
 * Get tournaments by league ID
 *
 * @param leagueId - The ID of the league to fetch tournaments for
 * @returns Promise with array of tournaments or error
 */
async function getTournamentsByLeagueName(
    leagueName: string
): Promise<ApiResponse<TournamentType[]>> {
    return apiRequest<TournamentType[]>(`/api/tournaments/league/${leagueName}`)
}

export { getTournamentsByLeagueName }
