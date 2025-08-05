/**
 * @fileoverview SWR-based preloader for champion statistics
 * 
 * This hook implements a pure SWR preloading strategy that populates the SWR cache
 * directly, ensuring instant tab switching by eliminating any loading states
 * when users access the statistics tab.
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { mutate } from 'swr'
import { getTournamentChampionStats } from '@/lib/api/champions'

interface UseChampionStatsPreloaderOptions {
    /** Array of tournament IDs to pre-load */
    tournamentIds: string[]
    /** Whether pre-loading is enabled (default: true) */
    enabled?: boolean
    /** Delay before starting pre-loading in ms (default: 1000) */
    delay?: number
    /** Maximum concurrent requests (default: 2) */
    concurrency?: number
}

/**
 * Generates the SWR cache key for champion statistics
 * Must match the key used in useChampionStats hook
 */
function getChampionStatsCacheKey(tournamentId: string): string {
    return `champion-stats-${tournamentId}`
}

/**
 * SWR-based hook for pre-loading champion statistics data
 * 
 * This hook:
 * - Pre-loads champion statistics directly into SWR cache
 * - Uses SWR's mutate function to populate cache with fetched data
 * - Implements queue system to limit concurrent requests
 * - Only pre-loads data that isn't already cached in SWR
 * - Starts pre-loading after a configurable delay
 * - Handles errors gracefully without affecting the UI
 * 
 * @param options - Configuration options for pre-loading
 * @returns Object with pre-loading status and manual trigger functions
 * 
 * @example
 * ```tsx
 * const { isPreloading, preloadTournament } = useChampionStatsPreloader({
 *   tournamentIds: seasons.map(s => s.tournamentId.toString()),
 *   enabled: true,
 *   delay: 2000, // Start after 2 seconds
 *   concurrency: 3 // Allow 3 concurrent requests
 * })
 * ```
 */
export const useChampionStatsPreloader = ({
    tournamentIds,
    enabled = true,
    delay = 1000,
    concurrency = 2
}: UseChampionStatsPreloaderOptions) => {
    const preloadingRef = useRef<Record<string, boolean>>({})
    const queueRef = useRef<string[]>([])
    const activeRequestsRef = useRef(0)
    const isPreloadingRef = useRef(false)
    const preloadedRef = useRef<Set<string>>(new Set())

    /**
     * Processes the pre-loading queue with concurrency control
     */
    const processQueueRef = useRef<(() => void) | null>(null)
    
    /**
     * Pre-loads champion statistics for a specific tournament into SWR cache
     * @param tournamentId - Tournament ID to pre-load
     */
    const preloadTournament = useCallback(async (tournamentId: string) => {
        // Skip invalid IDs
        if (!tournamentId || tournamentId === 'undefined') return

        const cacheKey = getChampionStatsCacheKey(tournamentId)

        // Skip if already preloaded or currently loading
        if (preloadedRef.current.has(tournamentId) || preloadingRef.current[tournamentId]) {
            return
        }

        // Check if data already exists in SWR cache
        try {
            const existingData = await mutate(cacheKey) // This returns current cached data
            if (existingData?.champions?.length > 0) {
                preloadedRef.current.add(tournamentId)
                return
            }
        } catch {
            // Ignore cache check errors
        }

        preloadingRef.current[tournamentId] = true

        try {
            // Fetch the data
            const statsResponse = await getTournamentChampionStats(tournamentId)
            
            if (!statsResponse.error && statsResponse.data) {
                // Populate SWR cache directly using mutate
                await mutate(
                    cacheKey,
                    statsResponse.data,
                    {
                        revalidate: false, // Don't revalidate after setting
                        populateCache: true, // Ensure cache is populated
                        optimisticData: statsResponse.data, // Use as optimistic data
                    }
                )
                
                preloadedRef.current.add(tournamentId)
                
                if (process.env.NODE_ENV === 'development') {
                    console.log(`✅ Preloaded champion stats for tournament ${tournamentId}`)
                }
            }
        } catch (err) {
            // Silent error handling for pre-loading
            if (process.env.NODE_ENV === 'development') {
                console.warn(`❌ Failed to preload champion stats for tournament ${tournamentId}:`, err)
            }
        } finally {
            preloadingRef.current[tournamentId] = false
            activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1)
            
            // Process next item in queue
            if (processQueueRef.current) {
                processQueueRef.current()
            }
        }
    }, [])

    const processQueue = useCallback(() => {
        if (queueRef.current.length === 0) {
            isPreloadingRef.current = false
            return
        }

        if (activeRequestsRef.current >= concurrency) {
            return // Wait for active requests to complete
        }

        const nextTournamentId = queueRef.current.shift()
        if (nextTournamentId) {
            activeRequestsRef.current += 1
            preloadTournament(nextTournamentId)
        }

        // Continue processing if there are more items and capacity
        if (queueRef.current.length > 0 && activeRequestsRef.current < concurrency) {
            // Use setTimeout to prevent stack overflow and allow other operations
            setTimeout(() => processQueueRef.current?.(), 10)
        }
    }, [concurrency, preloadTournament])
    
    // Store processQueue in ref to break circular dependency
    processQueueRef.current = processQueue

    /**
     * Starts the pre-loading process for all tournament IDs
     */
    const startPreloading = useCallback(() => {
        if (!enabled || tournamentIds.length === 0 || isPreloadingRef.current) {
            return
        }

        isPreloadingRef.current = true
        
        // Filter out tournaments that are already preloaded or in progress
        const tournamentsToPreload = tournamentIds.filter(id => 
            id && 
            id !== 'undefined' && 
            !preloadedRef.current.has(id) && 
            !preloadingRef.current[id]
        )

        if (tournamentsToPreload.length === 0) {
            isPreloadingRef.current = false
            return
        }

        // Add to queue
        queueRef.current = [...tournamentsToPreload]
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 Starting preload for ${tournamentsToPreload.length} tournaments`)
        }
        
        // Start processing
        processQueue()
    }, [enabled, tournamentIds, processQueue])

    /**
     * Manually preload a specific tournament (useful for hover effects)
     */
    const preloadSpecific = useCallback((tournamentId: string) => {
        if (!enabled || !tournamentId || tournamentId === 'undefined') return
        
        // Add to front of queue for priority processing
        if (!preloadedRef.current.has(tournamentId) && !preloadingRef.current[tournamentId]) {
            queueRef.current.unshift(tournamentId)
            processQueue()
        }
    }, [enabled, processQueue])

    /**
     * Clear all preload tracking (useful for cleanup)
     */
    const clearPreloadTracking = useCallback(() => {
        preloadingRef.current = {}
        queueRef.current = []
        activeRequestsRef.current = 0
        isPreloadingRef.current = false
        preloadedRef.current.clear()
    }, [])

    // Start pre-loading after delay
    useEffect(() => {
        if (!enabled || tournamentIds.length === 0) return

        const timer = setTimeout(startPreloading, delay)
        return () => clearTimeout(timer)
    }, [startPreloading, delay, enabled, tournamentIds.length])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearPreloadTracking()
        }
    }, [clearPreloadTracking])

    return {
        /** Whether pre-loading is currently active */
        isPreloading: isPreloadingRef.current,
        /** Number of tournaments already preloaded */
        preloadedCount: preloadedRef.current.size,
        /** Total tournaments to preload */
        totalCount: tournamentIds.length,
        /** Current queue length */
        queueLength: queueRef.current.length,
        /** Manually trigger pre-loading for a specific tournament */
        preloadTournament: preloadSpecific,
        /** Manually start the pre-loading process */
        startPreloading,
        /** Clear all preload tracking */
        clearPreloadTracking
    }
}

/**
 * Simple hook to check if champion stats are preloaded for a tournament
 * @param tournamentId - Tournament ID to check
 * @returns Whether the tournament stats are likely preloaded
 */
export const useIsChampionStatsPreloaded = (tournamentId: string): boolean => {
    const cacheKey = getChampionStatsCacheKey(tournamentId)
    
    // This is a simple check - SWR will handle the actual cache lookup
    useEffect(() => {
        // This effect just exists to create a dependency on the cache key
        // The actual preload status is determined by SWR cache internally
    }, [cacheKey])
    
    // We can't easily check SWR cache synchronously, so we assume
    // that if the key is valid, it might be preloaded
    return Boolean(tournamentId && tournamentId !== 'undefined')
}