'use client'

import React from 'react'
import { useStandingsWithTabsDataSWR } from '@/hooks/useStandingsDataSWR'
import { NewStandingsWithTabsClient } from '../clients/NewStandingsWithTabsClient'
import { MatchSkeleton } from '@/components/ui/skeleton/MatchSkeleton'
import { PlayoffBracket } from '../playOff/PlayoffBracket'
import useSWR from 'swr'
import { getTournamentPlayoffBracket } from '@/lib/api/tournaments'

/**
 * Props for the TournamentContentFetch component
 * @interface TournamentContentFetchProps
 * @property {number} tournamentId - Unique tournament identifier to display content for
 * @property {number | null} [maxRows=null] - Maximum number of rows to display (null to show all)
 * @property {string} [trackTeamName] - Optional team name to track in playoff bracket
 */
interface TournamentContentFetchProps {
    tournamentId: number
    maxRows?: number | null
    trackTeamName?: string
}

/**
 * Tournament content fetch component that automatically determines
 * whether to show standings or playoff bracket based on tournament type
 * 
 * @description
 * This component intelligently detects the tournament type:
 * - If the tournament has standings data with groups or regular standings → shows NewStandingsWithTabsClient
 * - If the tournament has no standings data → attempts to fetch playoff bracket data
 * 
 * Features:
 * - Automatic tournament type detection
 * - SWR caching for both standings and playoff data
 * - Smooth loading and error states
 * - Seamless switching between different tournament types
 * 
 * @param {TournamentContentFetchProps} props - Component properties
 * @param {number} props.tournamentId - Tournament ID to fetch content for
 * @param {number | null} [props.maxRows=null] - Optional limit for displayed rows (for standings only)
 * @param {string} [props.trackTeamName] - Optional team name to track in playoff bracket
 * 
 * @returns {JSX.Element} Rendered component with either:
 * - Loading skeleton while fetching data
 * - Error message if fetching fails
 * - NewStandingsWithTabsClient for group/regular tournaments
 * - PlayoffBracket for playoff tournaments
 * - No data message if tournament has no content
 * 
 * @example
 * ```tsx
 * // Display tournament content (automatically detects type)
 * <TournamentContentFetch tournamentId={123} />
 * 
 * // Track a specific team in playoffs
 * <TournamentContentFetch tournamentId={123} trackTeamName="T1" />
 * ```
 */
export const TournamentContentFetch = ({
    tournamentId,
    maxRows = null,
    trackTeamName,
}: TournamentContentFetchProps) => {
    // First, try to fetch standings data
    const { processedData, loading: standingsLoading, error: standingsError } = useStandingsWithTabsDataSWR(tournamentId)
    
    // Determine if we should fetch playoff data
    // We fetch playoff data when:
    // 1. Standings loading is complete
    // 2. Either no standings data exists OR standings returned an error (404)
    const shouldFetchPlayoffData = !standingsLoading && (
        !processedData || 
        processedData.length === 0 || 
        standingsError
    )
    
    const { data: playoffData, error: playoffError, isLoading: playoffLoading } = useSWR(
        shouldFetchPlayoffData ? `playoff-bracket-${tournamentId}` : null,
        async () => {
            const result = await getTournamentPlayoffBracket(tournamentId.toString())
            if (result.error) {
                throw new Error(result.error)
            }
            return result.data
        },
        {
            revalidateOnFocus: false,
            revalidateOnMount: true,
            dedupingInterval: 60000,
            errorRetryCount: 1
        }
    )
    
    // Show loading state while either request is in progress
    if (standingsLoading || (shouldFetchPlayoffData && playoffLoading)) {
        return <MatchSkeleton className="min-h-[535px]" />
    }
    
    // If we have standings data, show the standings view
    if (processedData && processedData.length > 0) {
        return (
            <NewStandingsWithTabsClient
                processedData={processedData}
                maxRows={maxRows}
            />
        )
    }
    
    // If we have playoff data, show the playoff bracket
    // The API returns an array directly, not an object with tournaments property
    if (playoffData && Array.isArray(playoffData) && playoffData.length > 0) {
        return (
            <PlayoffBracket
                tournaments={playoffData}
                trackTeamName={trackTeamName}
            />
        )
    }
    
    // Show error if there was an error fetching data
    if (standingsError || playoffError) {
        // Check if it's a 404 error (no playoff matches found)
        const is404 = playoffError?.message?.includes('Not found') || playoffError?.message?.includes('404')
        
        if (is404) {
            // No playoff matches found - this tournament might not be a playoff format
            return (
                <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Tournament</h3>
                    <p className="text-gray-400">This tournament does not have playoff bracket data.</p>
                    <p className="text-gray-400 text-sm mt-2">It may use a different format (league, groups, etc.)</p>
                </div>
            )
        }
        
        return (
            <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Tournament Data</h3>
                <p className="text-red-400">Error: {standingsError || playoffError?.message || 'Failed to load tournament data'}</p>
            </div>
        )
    }
    
    // No data available from either standings or playoffs
    return (
        <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Tournament</h3>
            <p className="text-gray-400">No tournament data available</p>
            <p className="text-gray-400 text-sm mt-2">This tournament may not have started yet or data is being updated.</p>
        </div>
    )
}