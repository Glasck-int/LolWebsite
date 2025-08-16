'use client'

import { useQuery } from '@tanstack/react-query'
import { Standings } from '@/generated/prisma'
import { getTournamentStandingsByTournamentId } from '@/lib/api/tournaments'
import { fetchEnrichedStandingsData } from '@/lib/api/standings'
import { ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'

/**
 * Result returned by the useStandingsWithTabsDataQuery hook
 * @interface UseStandingsWithTabsDataResult
 * @property {Standings[] | null} standings - Raw standings data fetched from the API
 * @property {ProcessedStanding[] | null} processedData - Enriched standings data with team statistics
 * @property {boolean} loading - Loading state indicator
 * @property {string | null} error - Error message if data fetching fails
 */
interface UseStandingsWithTabsDataResult {
    standings: Standings[] | null
    processedData: ProcessedStanding[] | null
    loading: boolean
    error: string | null
}

/**
 * Custom hook using React Query for fetching and caching tournament standings data
 * Equivalent to the previous useStandingsWithTabsDataSWR hook
 * 
 * @description
 * This hook provides automatic caching, request deduplication, and optimized error handling
 * using React Query. Data is automatically cached for 1 minute and is not revalidated on window focus
 * to prevent unnecessary requests.
 * 
 * @param {number | null} tournamentId - The tournament ID to fetch standings for
 * 
 * @returns {UseStandingsWithTabsDataResult} An object containing:
 * - standings: Raw tournament standings data
 * - processedData: Enriched data including team statistics and recent performance
 * - loading: Loading state (true while fetching data)
 * - error: Error message if fetching fails
 * 
 * @example
 * ```tsx
 * const { processedData, loading, error } = useStandingsWithTabsDataQuery(tournamentId)
 * 
 * if (loading) return <Skeleton />
 * if (error) return <Error message={error} />
 * if (!processedData) return <NoData />
 * 
 * return <StandingsTable data={processedData} />
 * ```
 * 
 * @remarks
 * - Data is cached with key `['standings-tabs', tournamentId]`
 * - Request deduplication is active for 60 seconds
 * - Focus revalidation is disabled for better performance
 * - Errors are retried once before displaying error state
 * - Returns null for standings and processedData properties when tournamentId is null
 */
export const useStandingsWithTabsDataQuery = (tournamentId: number | null): UseStandingsWithTabsDataResult => {
    const { data, error, isLoading } = useQuery({
        queryKey: ['standings-tabs', tournamentId],
        queryFn: async () => {
            if (!tournamentId) {
                throw new Error('Tournament ID is required')
            }
            
            // Fetch standings data from API
            const standingsResponse = await getTournamentStandingsByTournamentId(tournamentId.toString())
            
            // Handle error or empty response
            if (standingsResponse.error || !standingsResponse.data || standingsResponse.data.length === 0) {
                return {
                    standings: [],
                    processedData: [],
                    tournamentName: ''
                }
            }

            // Extract tournament name from standings data
            // The overviewPage field contains the tournament name
            const tournamentName = standingsResponse.data[0]?.overviewPage || ''
            
            let enrichedData: ProcessedStanding[] = []
            if (tournamentName) {
                // Fetch enriched data including:
                // - Detailed team information
                // - Recent matches
                // - Game statistics
                const enrichedDataResponse = await fetchEnrichedStandingsData(
                    standingsResponse.data,
                    tournamentName
                )
                enrichedData = enrichedDataResponse.processedData
            }

            return {
                standings: standingsResponse.data,
                processedData: enrichedData,
                tournamentName
            }
        },
        enabled: !!tournamentId,
        
        // Cache configuration equivalent to SWR settings
        staleTime: 60000, // 1 minute - data stays fresh
        gcTime: 120000, // 2 minutes garbage collection  
        refetchOnWindowFocus: false, // Disabled to prevent unnecessary requests on focus
        refetchOnMount: true, // Enabled to load data when component mounts
        retry: 1, // Single retry attempt on error
    })

    return {
        standings: data?.standings || null,
        processedData: data?.processedData || null,
        loading: isLoading,
        error: error?.message || null
    }
}