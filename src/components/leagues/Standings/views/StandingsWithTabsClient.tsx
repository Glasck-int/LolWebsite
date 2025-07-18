'use client'

import React from 'react'
import { StandingsWithTabsClient as StandingsWithTabsClientComponent } from '../clients/StandingsWithTabsClient'
import { useTournament } from '@/contexts/TournamentContext'

interface StandingsWithTabsClientProps {
    maxRows?: number | null
}

export const StandingsWithTabsClient = ({ maxRows }: StandingsWithTabsClientProps) => {
    const { enrichedStandingsData } = useTournament()

    if (!enrichedStandingsData) {
        return <div>Error loading standings</div>
    }

    return (
        <StandingsWithTabsClientComponent
            processedData={enrichedStandingsData}
            maxRows={maxRows}
        />
    )
}