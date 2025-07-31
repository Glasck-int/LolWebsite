'use client'

import React from 'react'
import { useStandingsData } from '@/hooks/useStandingsData'
import { StandingsOverviewClient } from '../clients/StandingsOverviewClient'
import { MatchSkeleton } from '@/components/ui/skeleton/MatchSkeleton'
interface StandingsOverviewFetchProps {
    tournamentId: number
    highlightedTeam?: string
    maxRows?: number | null
}

export const StandingsOverviewFetch = ({
    tournamentId,
    highlightedTeam,
    maxRows = 3,
}: StandingsOverviewFetchProps) => {
    const { processedData, loading, error } = useStandingsData(tournamentId)

    if (loading) {
        return (
            <MatchSkeleton />
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Classements</h3>
                <p className="text-red-400">Erreur: {error}</p>
            </div>
        )
    }



    return (
        (processedData && processedData.length > 0) && (
        <StandingsOverviewClient
            processedData={processedData}
            highlightedTeam={highlightedTeam}
                maxRows={maxRows}
            />
        )
    )
}