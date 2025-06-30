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

export { getApiBaseUrl }
