'use client'

import React from 'react'
import { useStandingsWithTabsData } from '@/hooks/useStandingsData'
import { StandingsWithTabsClient } from '../clients/StandingsWithTabsClient'
import { MatchSkeleton } from '@/components/ui/skeleton/MatchSkeleton'

interface StandingsWithTabsFetchProps {
    tournamentId: number
    maxRows?: number | null
}

export const StandingsWithTabsFetch = ({
    tournamentId,
    maxRows = null,
}: StandingsWithTabsFetchProps) => {
    const { processedData, loading, error } = useStandingsWithTabsData(tournamentId)

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
        return (
            <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Statistiques</h3>
                <p>Aucune statistique disponible pour ce tournoi</p>
            </div>
        )
    }

    return (
        <StandingsWithTabsClient
            processedData={processedData}
            maxRows={maxRows}
        />
    )
}