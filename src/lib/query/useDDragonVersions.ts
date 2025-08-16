'use client'

import { useQuery } from '@tanstack/react-query'
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
 * Optimized React Query hook for DDragon versions
 * Configured with longer cache times since versions don't change frequently
 * Equivalent to the previous useDDragonVersions SWR hook
 */
export function useDDragonVersions() {
    const {
        data,
        error,
        isLoading,
        isFetching,
        refetch
    } = useQuery({
        queryKey: [DDRAGON_VERSIONS_KEY],
        queryFn: fetchDDragonVersions,
        
        // Very aggressive caching for DDragon versions
        staleTime: Infinity, // Never consider stale
        gcTime: Infinity, // Never garbage collect
        
        // Never auto-refetch DDragon versions
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        
        // Don't retry - fail fast to use fallback
        retry: false,
        
        // Fallback to a known stable version
        placeholderData: ['14.24.1'],
        
        // Extended timeout
        networkMode: 'online',
    })

    // Get the latest version with fallback
    const latestVersion = data?.[0] || '14.24.1'
    
    return {
        versions: data || ['14.24.1'],
        latestVersion,
        error: error?.message || null,
        isLoading: !data && !error && isLoading,
        isValidating: isFetching,
        mutate: refetch,
        
        // Helper methods
        refetch: () => refetch(),
        
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