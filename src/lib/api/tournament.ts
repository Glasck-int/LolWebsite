import { Tournament } from '@/generated/prisma'
import { apiRequest, ApiResponse } from './utils'

/**
 * Get tournament by ID
 *
 * @param tournamentId - The ID of the tournament to fetch
 * @returns Promise with tournament or error
 */
export async function getTournamentById(
    tournamentId: number
): Promise<ApiResponse<Tournament | null>> {
    const response = await apiRequest<Tournament[]>(
        `/api/tournaments/id/${tournamentId}`
    )
    
    if (response.error) {
        return { data: null, error: response.error }
    }
    
    return { 
        data: response.data && response.data.length > 0 ? response.data[0] : null, 
        error: null 
    }
}