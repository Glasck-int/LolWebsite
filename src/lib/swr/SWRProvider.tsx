'use client'

import React from 'react'
import { SWRConfig } from 'swr'

/**
 * SWR Configuration Provider optimized for instant tab switching
 * This provider configures SWR with aggressive caching to eliminate loading states
 * and provide truly instant tab switching for champion statistics
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                // Aggressive caching settings for instant access
                dedupingInterval: 300000, // 5 minutes deduping - avoid duplicate requests
                focusThrottleInterval: 600000, // 10 minutes focus throttle
                
                // Revalidation settings - prioritize cache over freshness for instant UX
                revalidateOnFocus: false, // Never revalidate on focus to prevent lag
                revalidateOnReconnect: false, // Don't revalidate on reconnect to avoid interruptions
                revalidateIfStale: false, // Don't revalidate stale data automatically
                revalidateOnMount: false, // Don't revalidate on mount if data exists
                refreshInterval: 0, // Never auto-refresh
                
                // Error handling - be more tolerant to avoid loading states
                errorRetryCount: 1, // Reduce retries to fail fast
                errorRetryInterval: 10000, // Longer interval between retries
                shouldRetryOnError: (error) => {
                    // Only retry on network errors, not client errors
                    return error?.message?.includes('NetworkError') || 
                           error?.message?.includes('Failed to fetch') ||
                           error?.status >= 500
                },
                
                // Performance optimizations for instant access
                loadingTimeout: 10000, // Longer timeout
                
                // Use a persistent cache provider for better memory management
                provider: () => {
                    // Create a more persistent cache that survives longer
                    const cache = new Map()
                    
                    // Extend the cache with better memory management
                    const originalSet = cache.set.bind(cache)
                    cache.set = (key, value) => {
                        // Add timestamp for better cache management
                        const wrappedValue = {
                            ...value,
                            __cached_at: Date.now()
                        }
                        return originalSet(key, wrappedValue)
                    }
                    
                    return cache
                },
                
                // Always keep previous data to prevent flicker
                keepPreviousData: true,
                
                // Default fetcher function
                fetcher: async (url: string) => {
                    const response = await fetch(url, {
                        // Add cache headers for better browser caching
                        headers: {
                            'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
                        }
                    })
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }
                    return response.json()
                },
                
                // Error handling
                onError: (error, key) => {
                    // Only log errors in development to reduce noise
                    if (process.env.NODE_ENV === 'development') {
                        console.error('SWR Error:', { error: error.message, key })
                    }
                },
                
                // Success callback for debugging and cache management
                onSuccess: (data, key) => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('SWR Cache Hit:', { 
                            key, 
                            hasData: !!data,
                            timestamp: new Date().toISOString().split('T')[1].split('.')[0]
                        })
                    }
                },
                
                // Additional optimizations
                compare: (a, b) => {
                    // Custom comparison to avoid unnecessary re-renders
                    if (a === b) return true
                    if (!a || !b) return false
                    
                    // For champion stats, compare by length and basic structure
                    if (a.champions && b.champions) {
                        return (
                            a.champions.length === b.champions.length &&
                            a.tournament === b.tournament &&
                            a.totalGames === b.totalGames
                        )
                    }
                    
                    return false
                }
            }}
        >
            {children}
        </SWRConfig>
    )
}