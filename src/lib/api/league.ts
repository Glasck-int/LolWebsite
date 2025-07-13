import { League as LeagueType } from '../../../backend/src/generated/prisma'
import { MatchSchedule as MatchScheduleType } from '../../../backend/src/generated/prisma'
import { apiRequest, ApiResponse } from './utils'

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

/**
 * Get the next three matches for a league by ID
 *
 * @param leagueId - The ID of the league to fetch next matches for
 * @returns Promise with array of next matches or error
 */
async function getNextThreeMatchesForLeague(
    leagueId: number
): Promise<ApiResponse<MatchScheduleType[]>> {
    return apiRequest<MatchScheduleType[]>(
        `/api/leagues/id/${leagueId}/next-matches`
    )
}

export {
    getAllLeagues,
    getMajorLeagues,
    getLeagueById,
    getLeagueBySlug,
    getNextThreeMatchesForLeague,
}
