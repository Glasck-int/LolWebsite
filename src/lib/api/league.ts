import { League as LeagueType } from '../../../backend/src/generated/prisma'
import { getApiBaseUrl, apiRequest, ApiResponse } from './utils'



/**
 * Get a league by its ID
 *
 * @param id - The ID of the league to fetch
 * @returns Promise with league data or error
 */
async function getLeagueById(id: number): Promise<ApiResponse<LeagueType>> {
    return apiRequest<LeagueType>(`/api/leagues/id/${id}`)
}

/**
 * Get a league by its slug
 *
 * @param slug - The slug of the league to fetch
 * @returns Promise with league data or error
 */
async function getLeagueBySlug(slug: string): Promise<ApiResponse<LeagueType>> {
    return apiRequest<LeagueType>(`/api/leagues/slug/${slug}`)
}

/**
 * Get all leagues from the API
 *
 * @returns Promise with array of leagues or error
 */
async function getAllLeagues(): Promise<ApiResponse<LeagueType[]>> {
    return apiRequest<LeagueType[]>('/api/leagues') // Ajout du préfixe /api
}

/**
 * Get only major leagues from the API
 *
 * @returns Promise with array of major leagues or error
 */
async function getMajorLeagues(): Promise<ApiResponse<LeagueType[]>> {
    return apiRequest<LeagueType[]>('/api/leagues/major')
}

export {
    getAllLeagues,
    getMajorLeagues,
    getLeagueById,
    getLeagueBySlug,
}
