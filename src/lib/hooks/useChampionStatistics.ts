'use client'

import { useApiCache } from './useApiCache'
import { getTournamentChampionStats, TournamentChampionStatsResponse } from '@/lib/api/champions'
import { DDragon } from '@/lib/api/ddragon'

/**
 * Combined data structure for champion statistics and DDragon version
 */
interface ChampionStatisticsData {
    championStats: TournamentChampionStatsResponse
    ddragonVersion: string
}

/**
 * Configuration for the champion statistics hook
 */
interface UseChampionStatisticsConfig {
    /** Cache TTL in milliseconds (default: 10 minutes) */
    ttl?: number
    /** Storage type (default: 'sessionStorage') */
    storage?: 'sessionStorage' | 'localStorage' | 'memory'
    /** Enable background refresh (default: true) */
    enableBackgroundRefresh?: boolean
}

/**
 * Custom hook for fetching and caching champion statistics with DDragon version
 * 
 * This hook combines two API calls:
 * 1. DDragon version information
 * 2. Tournament champion statistics
 * 
 * Both are cached independently but returned together for seamless usage.
 * DDragon versions are cached for a longer period since they change less frequently.
 * 
 * @param tournamentId The tournament ID to fetch statistics for
 * @param config Configuration options
 * @returns Object with combined data, loading states, and cache management functions
 * 
 * @example
 * ```typescript
 * const { data, loading, error, refetch } = useChampionStatistics('tournament-123')
 * 
 * if (data) {
 *   console.log('DDragon version:', data.ddragonVersion)
 *   console.log('Champion stats:', data.championStats.champions)
 * }
 * ```
 */
export function useChampionStatistics(
    tournamentId: string,
    config: UseChampionStatisticsConfig = {}
) {
    const {
        ttl = 10 * 60 * 1000, // 10 minutes default
        storage = 'sessionStorage',
        enableBackgroundRefresh = true
    } = config

    // Cache DDragon versions for longer since they don't change often
    const {
        data: ddragonVersions,
        loading: ddragonLoading,
        error: ddragonError,
        refetch: refetchDdragon
    } = useApiCache(
        'ddragon-versions',
        DDragon.getVersions,
        {
            ttl: 60 * 60 * 1000, // 1 hour for DDragon versions
            storage,
            enableBackgroundRefresh
        }
    )

    // Cache champion statistics
    const {
        data: championStatsResponse,
        loading: championStatsLoading,
        error: championStatsError,
        refetch: refetchChampionStats,
        isFromCache: championStatsFromCache,
        cacheAge: championStatsCacheAge,
        mutate: mutateChampionStats,
        clearCache: clearChampionStatsCache
    } = useApiCache(
        `champion-stats-${tournamentId}`,
        async () => {
            const response = await getTournamentChampionStats(tournamentId)
            
            if (response.error) {
                throw new Error(response.error)
            }
            
            if (!response.data) {
                throw new Error('No data received from champion stats API')
            }
            
            return response.data
        },
        {
            ttl,
            storage,
            enableBackgroundRefresh
        }
    )

    // Determine loading state - we're loading if either is loading AND we don't have cached data
    const loading = (ddragonLoading && !ddragonVersions) || (championStatsLoading && !championStatsResponse)
    
    // Combine errors with priority to champion stats errors
    const error = championStatsError || ddragonError
    
    // Get the latest DDragon version
    const ddragonVersion = ddragonVersions && ddragonVersions.length > 0 
        ? ddragonVersions[0] 
        : '14.24.1' // Fallback version

    // Combined data - only available when both requests have completed successfully
    const data: ChampionStatisticsData | null = championStatsResponse ? {
        championStats: championStatsResponse,
        ddragonVersion
    } : null

    // Enhanced refetch that refetches both data sources
    const refetch = async () => {
        await Promise.all([
            refetchDdragon(),
            refetchChampionStats()
        ])
    }

    // Clear all related caches
    const clearCache = () => {
        clearChampionStatsCache()
        // Note: We typically don't clear DDragon version cache as it's shared
    }

    // Check if we have any cached data
    const hasData = !!data
    const isEmpty = data && data.championStats.champions.length === 0

    return {
        data,
        loading,
        error,
        refetch,
        clearCache,
        
        // Additional metadata
        hasData,
        isEmpty,
        isFromCache: championStatsFromCache,
        cacheAge: championStatsCacheAge,
        
        // Individual data pieces for more granular access
        championStats: championStatsResponse,
        ddragonVersion,
        
        // Individual loading states for fine-grained control
        championStatsLoading,
        ddragonLoading,
        
        // Individual errors
        championStatsError,
        ddragonError,
        
        // Cache management for champion stats specifically
        mutateChampionStats,
        refetchChampionStats: () => refetchChampionStats(),
        
        // Utility functions
        isReady: !loading && !error && hasData,
        tournament: data?.championStats.tournament,
        totalGames: data?.championStats.totalGames,
        uniqueChampions: data?.championStats.uniqueChampions
    }
}

/**
 * Hook for preloading champion statistics data
 * Useful for prefetching data for tabs or pages that might be accessed soon
 * 
 * @param tournamentId The tournament ID to preload data for
 * @param shouldPreload Whether to actually preload (default: true)
 * @param config Configuration options
 * 
 * @example
 * ```typescript
 * // Preload data for tournament that might be accessed
 * usePreloadChampionStatistics('tournament-456', shouldPreloadNextTab)
 * ```
 */
export function usePreloadChampionStatistics(
    tournamentId: string,
    shouldPreload = true,
    config: UseChampionStatisticsConfig = {}
) {
    // Use the main hook but don't return data to avoid unnecessary re-renders
    const { refetch } = useChampionStatistics(tournamentId, config)
    
    // The useChampionStatistics hook will automatically handle caching
    // and the data will be available instantly when the component that needs it mounts
    
    return {
        preload: shouldPreload ? refetch : () => Promise.resolve()
    }
}