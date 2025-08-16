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
                // Cache ultra-agressif pour éliminer les délais
                staleTime: 300000, // 5 minutes - data stays fresh
                gcTime: 1800000, // 30 minutes - garde en cache plus longtemps
                
                // Optimisations pour navigation instantanée
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false, // CRUCIAL: ne pas refetch si on a des données
                refetchInterval: false,
                
                // Retry minimal pour éviter les délais
                retry: (failureCount, error: unknown) => {
                    // Ne retry que les erreurs réseau, pas les 404/400
                    const statusError = error as { status?: number }
                    if (statusError?.status && statusError.status >= 400 && statusError.status < 500) return false
                    return failureCount < 1
                },
                retryDelay: 5000, // Délai plus court
                
                // Performance optimizations
                networkMode: 'online',
                
                // Garde les données précédentes pour éviter les flickers
                placeholderData: (previousData: unknown) => previousData,
                
                // Optimisation cruciale: structure sharing pour éviter les re-renders
                structuralSharing: true,
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