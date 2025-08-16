'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DevTools } from './DevTools'

/**
 * Create a QueryClient with optimized configuration equivalent to SWR settings
 */
function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Aggressive caching settings for instant access (equivalent to SWR config)
                staleTime: 300000, // 5 minutes - data stays fresh
                gcTime: 600000, // 10 minutes - garbage collection time (was cacheTime in v4)
                
                // Revalidation settings - prioritize cache over freshness for instant UX
                refetchOnWindowFocus: false, // Never revalidate on focus to prevent lag
                refetchOnReconnect: false, // Don't refetch on reconnect to avoid interruptions
                refetchOnMount: false, // Don't refetch on mount if data exists
                refetchInterval: false, // Never auto-refresh
                
                // Error handling - be more tolerant to avoid loading states
                retry: 1, // Reduce retries to fail fast
                retryDelay: 10000, // Longer interval between retries (10 seconds)
                
                // Only retry on network errors, not client errors
                retryOnMount: true,
                
                // Performance optimizations for instant access
                networkMode: 'online',
                
                // Keep previous data to prevent flicker
                placeholderData: (previousData: unknown) => previousData,
            },
            
            mutations: {
                retry: 1,
                networkMode: 'online',
            }
        }
    })
}

/**
 * React Query Configuration Provider optimized for instant tab switching
 * This provider configures React Query with aggressive caching to eliminate loading states
 * and provide truly instant tab switching for champion statistics
 * 
 * Equivalent to the previous SWRProvider but with React Query
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    // Use React.useMemo to ensure we don't recreate the client on every render
    const [queryClient] = React.useState(() => createQueryClient())

    // Add global query monitoring for development debugging
    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 React Query Provider initialized')
            
            // Add global query observer
            const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
                if (event?.type === 'observerResultsUpdated') {
                    const query = event.query
                    console.log('📊 Query Update:', {
                        queryKey: query.queryKey,
                        status: query.state.status,
                        dataUpdatedAt: new Date(query.state.dataUpdatedAt).toLocaleTimeString(),
                        error: query.state.error?.message
                    })
                }
            })
            
            return unsubscribe
        }
    }, [queryClient])

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <DevTools />
        </QueryClientProvider>
    )
}

/**
 * Default fetcher function equivalent to SWR's fetcher
 */
export const defaultFetcher = async (url: string) => {
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
}