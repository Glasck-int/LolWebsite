import { League as LeagueType } from '../../../backend/src/generated/prisma'
import { getApiBaseUrl } from './image'

/**
 * API response wrapper for error handling
 */
export interface ApiResponse<T> {
    data?: T
    error?: string
}

/**
 * Make HTTP request with proper error handling
 *
 * @param endpoint - API endpoint path (without base URL)
 * @param options - Fetch options
 * @returns Promise with typed response data
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const API_BASE_URL = getApiBaseUrl()

        console.log(`Making request to: ${API_BASE_URL}${endpoint}`)

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            // Important: disable cache for server-side requests
            cache: 'no-store',
            ...options,
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return { data  }
    } catch (error) {
        console.error('API request failed:', error)
        return {
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

async function getLeagueImage(
    leagueName: string
): Promise<ApiResponse<string | null>> {
    try {
        const API_BASE_URL = getApiBaseUrl()
        const imageUrl = `${API_BASE_URL}/static/leagues/${leagueName}.webp`

        // For client-side requests, let the browser handle caching
        // The server should set appropriate cache headers
        return { data: imageUrl || null }
    } catch (error) {
        console.error('Image URL generation failed:', error)
        return { data: null }
    }
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
    return apiRequest<LeagueType[]>('/api/leagues/major') // Ajout du préfixe /api
}

export { getAllLeagues, getMajorLeagues, getLeagueImage }
