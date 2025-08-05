'use client'

import React from 'react'
import { useStandingsWithTabsDataSWR } from '@/hooks/useStandingsDataSWR'
import { NewStandingsWithTabsClient } from '../clients/NewStandingsWithTabsClient'
import { MatchSkeleton } from '@/components/ui/skeleton/MatchSkeleton'

/**
 * Props for the NewStandingsWithTabsFetch component
 * @interface NewStandingsWithTabsFetchProps
 * @property {number} tournamentId - Unique tournament identifier to display standings for
 * @property {number | null} [maxRows=null] - Maximum number of rows to display (null to show all)
 */
interface NewStandingsWithTabsFetchProps {
    tournamentId: number
    maxRows?: number | null
}

/**
 * Standings fetch component with SWR caching system
 * 
 * @description
 * This component fetches tournament standings data using SWR for caching,
 * enriches it with detailed statistics, and passes it to the client component for display.
 * 
 * Features:
 * - Automatic client-side data caching
 * - Automatic deduplication of concurrent requests
 * - Optimized loading and error state handling
 * - Smart data revalidation
 * 
 * @param {NewStandingsWithTabsFetchProps} props - Component properties
 * @param {number} props.tournamentId - Tournament ID to fetch standings for
 * @param {number | null} [props.maxRows=null] - Optional limit for displayed rows
 * 
 * @returns {JSX.Element} Rendered component with either:
 * - Loading skeleton while fetching data
 * - Error message if fetching fails
 * - No data message if tournament has no standings
 * - NewStandingsWithTabsClient component with enriched data
 * 
 * @example
 * ```tsx
 * // Display all tournament standings
 * <NewStandingsWithTabsFetch tournamentId={123} />
 * 
 * // Limit display to top 10 teams
 * <NewStandingsWithTabsFetch tournamentId={123} maxRows={10} />
 * ```
 * 
 * @see {@link useStandingsWithTabsDataSWR} - Hook used for data fetching
 * @see {@link NewStandingsWithTabsClient} - Client component for data display
 */
export const NewStandingsWithTabsFetch = ({
    tournamentId,
    maxRows = null,
}: NewStandingsWithTabsFetchProps) => {
    const { processedData, loading, error } = useStandingsWithTabsDataSWR(tournamentId)

    if (loading) {
        return (
            <MatchSkeleton className="min-h-[535px]" />
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Statistiques</h3>
                <p className="text-red-400">Erreur: {error}</p>
            </div>
        )
    }

    if (!processedData || processedData.length === 0) {
        // Don't render anything if there are no standings
        return null
    }

    return (
        <NewStandingsWithTabsClient
            processedData={processedData}
            maxRows={maxRows}
        />
    )
}