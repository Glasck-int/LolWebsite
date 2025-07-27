/**
 * API response wrapper for error handling
 */
export interface ApiResponse<T> {
    data?: T
    error?: string
}

interface CacheStrategy {
    type: 'static' | 'dynamic' | 'live'
    revalidate?: number
}

const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
    // Données statiques (cache long)
    '/api/leagues': { type: 'static', revalidate: 24 * 60 * 60 },
    '/api/leagues/major': { type: 'static', revalidate: 24 * 60 * 60 },
    '/api/teams': { type: 'static', revalidate: 12 * 60 * 60 },

    // Données dynamiques (cache court)
    '/api/standings': { type: 'dynamic', revalidate: 5 * 60 },
    '/api/player-stats': { type: 'dynamic', revalidate: 10 * 60 },
    '/api/tournaments/matches': { type: 'dynamic', revalidate: 10 * 60 },

    // Données temps réel (pas de cache)
    '/api/live-matches': { type: 'live' },
    '/api/current-scores': { type: 'live' },
}

function getCacheConfig(endpoint: string): RequestInit {
    // Check for tournament patterns first
    if (endpoint.includes('/tournaments/') && (endpoint.includes('/next-matches') || endpoint.includes('/last-matches') || endpoint.includes('/matches'))) {
        return { next: { revalidate: 10 * 60 } } // 10 minutes
    }
    
    // Check for team images
    if (endpoint.includes('/teams/') && endpoint.includes('/image')) {
        return { next: { revalidate: 24 * 60 * 60 } } // 24 hours
    }
    
    const strategy = CACHE_STRATEGIES[endpoint] || {
        type: 'dynamic',
        revalidate: 60 * 60,
    }
    // console.log('🔄 [CACHE] Strategy:', strategy)
    switch (strategy.type) {
        case 'static':
            return { next: { revalidate: strategy.revalidate } }
        case 'dynamic':
            return { next: { revalidate: strategy.revalidate } }
        case 'live':
            return { cache: 'no-store' }
        default:
            return { next: { revalidate: 60 * 60 } }
    }
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

        const cacheConfig = getCacheConfig(endpoint)

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...cacheConfig,
            ...options,
        })

        if (!response.ok) {
            if (response.status === 404) {
                return { data: undefined, error: `Not found: ${endpoint}` }
            }
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return { data }
    } catch (error) {
        console.error('API request failed:', error)
        return {
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * API client configuration and utilities
 *
 * Provides a centralized way to make HTTP requests to the backend API
 * with proper error handling and type safety.
 */

// Different URLs for server-side vs client-side
const getApiBaseUrl = () => {
    // Server-side: use internal URL or localhost
    if (typeof window === 'undefined') {
        return process.env.API_URL || 'http://127.0.0.1:3001'
    }
    // Client-side: use public URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'
}

export { getApiBaseUrl, apiRequest }
