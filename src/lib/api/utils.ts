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
        return process.env.API_URL || 'http://localhost:3001'
    }
    // Client-side: use public URL
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

export { getApiBaseUrl, apiRequest }
