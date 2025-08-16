'use client'

import React from 'react'
import { useStandingsOverviewQuery } from '@/hooks/useStandingsOverviewQuery'
import { StandingsOverviewClient } from '../clients/StandingsOverviewClient'
import { MatchSkeleton } from '@/components/ui/skeleton/MatchSkeleton'

interface StandingsOverviewFetchProps {
    tournamentId: number
    highlightedTeam?: string
    maxRows?: number | null
}

/**
 * Standings overview fetch component with React Query caching system
 * 
 * @description
 * This component fetches tournament standings data using React Query for caching,
 * enriches it with team data, recent matches, and images, then passes it to the client component.
 * 
 * Features:
 * - Automatic client-side data caching
 * - Automatic deduplication of concurrent requests
 * - Optimized loading and error state handling
 * - Smart data revalidation
 */
export const StandingsOverviewFetch = ({
    tournamentId,
    highlightedTeam,
    maxRows = 3,
}: StandingsOverviewFetchProps) => {
    const { data, loading, error } = useStandingsOverviewQuery(tournamentId)

    if (loading) {
        return (
            <MatchSkeleton className="min-h-[300px]" />
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Aperçu</h3>
                <p className="text-red-400">Erreur: {error}</p>
            </div>
        )
    }

    if (!data || !data.processedData || data.processedData.length === 0) {
        // Don't render anything if there are no standings
        return null
    }

    return (
        <StandingsOverviewClient
            processedData={data.processedData}
            highlightedTeam={highlightedTeam}
            maxRows={maxRows}
        />
    )
}