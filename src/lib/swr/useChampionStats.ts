'use client'

import useSWR from 'swr'
import { getTournamentChampionStats, TournamentChampionStatsResponse } from '@/lib/api/champions'

/**
 * Cache key generator for champion statistics
 * Creates consistent, unique keys for tournament-specific data
 */
function getChampionStatsCacheKey(tournamentId: string | number): string {
    return `champion-stats-${tournamentId}`
}

/**
 * Custom fetcher function that wraps the API call and handles the response format
 */
async function fetchChampionStats(tournamentId: string): Promise<TournamentChampionStatsResponse> {
    const response = await getTournamentChampionStats(tournamentId)
    
    if (response.error) {
        throw new Error(response.error)
    }
    
    if (!response.data) {
        throw new Error('No data received from champion stats API')
    }
    
    return response.data
}

/**
 * Optimized SWR hook for tournament champion statistics
 * Configured for truly instant tab switching with aggressive caching
 */
export function useChampionStats(tournamentId: string | number, initialData?: TournamentChampionStatsResponse) {
    const tournamentIdStr = tournamentId.toString()
    const cacheKey = getChampionStatsCacheKey(tournamentId)
    
    const {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    } = useSWR(
        tournamentIdStr && tournamentIdStr !== 'undefined' ? cacheKey : null,
        () => fetchChampionStats(tournamentIdStr),
        {
            // Use initial data if provided (from server)
            fallbackData: initialData,
            // Hyper-aggressive caching for instant switching
            revalidateOnFocus: false, // Never revalidate on focus
            revalidateOnMount: false, // Don't revalidate if data exists
            revalidateIfStale: false, // Never auto-revalidate stale data
            revalidateOnReconnect: false, // Don't revalidate on reconnect
            dedupingInterval: Infinity, // Never make duplicate requests
            
            // Never auto-refresh
            refreshInterval: 0,
            
            // Always keep previous data to eliminate flicker
            keepPreviousData: true,
            
            // Minimal error handling to fail fast
            shouldRetryOnError: false, // Don't retry on errors to avoid loading states
            errorRetryCount: 0, // No retries
            
            // Extended timeout since we prioritize cache over network
            loadingTimeout: 60000, // 1 minute timeout
            
            // Performance optimizations
            compare: (a, b) => {
                // Custom comparison to avoid unnecessary re-renders
                if (a === b) return true
                if (!a || !b) return false
                
                // Fast comparison for champion stats
                return (
                    a.tournament === b.tournament &&
                    a.totalGames === b.totalGames &&
                    a.champions?.length === b.champions?.length
                )
            },
            
            // Don't suspend to avoid loading states
            suspense: false
        }
    )

    // Optimized state calculations with useMemo-like behavior
    const hasData = (data?.champions?.length ?? 0) > 0
    const isEmpty = data && (data.champions?.length ?? 0) === 0

    return {
        data,
        error: error?.message || null,
        // Only show loading on very first load when absolutely no data exists
        isLoading: !data && !error && isLoading && !hasData,
        isValidating,
        mutate,
        
        // Computed states for better UX (memoized-like)
        hasData,
        isEmpty,
        
        // Helper methods
        refetch: () => mutate(),
        clearCache: () => mutate(undefined, { revalidate: false }),
        
        // Additional helpers for debugging
        cacheKey,
        isCached: !!data
    }
}

/**
 * Hook to preload champion stats data for better perceived performance
 * Use this to preload data for tabs that are likely to be clicked
 */
export function usePreloadChampionStats(tournamentId: string | number, shouldPreload = true) {
    const tournamentIdStr = tournamentId.toString()
    const cacheKey = getChampionStatsCacheKey(tournamentId)
    
    const { mutate } = useSWR(
        shouldPreload && tournamentIdStr ? cacheKey : null,
        () => fetchChampionStats(tournamentIdStr),
        {
            revalidateOnMount: false,
            revalidateOnFocus: false,
            revalidateIfStale: false,
            dedupingInterval: Infinity, // Never duplicate preload requests
        }
    )
    
    return { preload: mutate }
}