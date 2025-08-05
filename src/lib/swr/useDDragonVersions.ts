'use client'

import useSWR from 'swr'
import { DDragon } from '@/lib/api/ddragon'

/**
 * Cache key for DDragon versions
 */
const DDRAGON_VERSIONS_KEY = 'ddragon-versions'

/**
 * Custom fetcher function for DDragon versions
 */
async function fetchDDragonVersions(): Promise<string[]> {
    const versions = await DDragon.getVersions()
    
    if (!versions || versions.length === 0) {
        throw new Error('No DDragon versions available')
    }
    
    return versions
}

/**
 * Optimized SWR hook for DDragon versions
 * Configured with longer cache times since versions don't change frequently
 */
export function useDDragonVersions() {
    const {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    } = useSWR(
        DDRAGON_VERSIONS_KEY,
        fetchDDragonVersions,
        {
            // Very aggressive caching for DDragon versions
            revalidateOnFocus: false,
            revalidateOnMount: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
            dedupingInterval: Infinity, // Never duplicate
            
            // Never auto-refresh DDragon versions
            refreshInterval: 0,
            
            // Keep previous data
            keepPreviousData: true,
            
            // Don't retry - fail fast to use fallback
            shouldRetryOnError: false,
            errorRetryCount: 0,
            
            // Extended timeout
            loadingTimeout: 30000, // 30 seconds
            
            // Fallback to a known stable version
            fallbackData: ['14.24.1'],
            
            // Don't suspend
            suspense: false
        }
    )

    // Get the latest version with fallback
    const latestVersion = data?.[0] || '14.24.1'
    
    return {
        versions: data || ['14.24.1'],
        latestVersion,
        error: error?.message || null,
        isLoading: !data && !error && isLoading,
        isValidating,
        mutate,
        
        // Helper methods
        refetch: () => mutate(),
        
        // Additional info
        hasData: !!data,
        versionCount: data?.length || 0
    }
}

/**
 * Hook to get a specific DDragon version with fallback
 */
export function useDDragonVersion(preferredVersion?: string) {
    const { versions, latestVersion } = useDDragonVersions()
    
    // Use preferred version if available in the list, otherwise use latest
    const version = preferredVersion && versions.includes(preferredVersion)
        ? preferredVersion
        : latestVersion
    
    return {
        version,
        isLatest: version === latestVersion,
        availableVersions: versions
    }
}