'use client'

import React from 'react'
import { StandingsOverviewClient as StandingsOverviewClientComponent } from '../clients/StandingsOverviewClient'
import { useTournament } from '@/contexts/TournamentContext'

interface StandingsOverviewClientProps {
    highlightedTeam?: string
    maxRows?: number | null
}

export const StandingsOverviewClient = ({ 
    highlightedTeam, 
    maxRows 
}: StandingsOverviewClientProps) => {
    const { enrichedStandingsData } = useTournament()

    if (!enrichedStandingsData) {
        return <div>Error loading standings</div>
    }

    return (
        <StandingsOverviewClientComponent
            processedData={enrichedStandingsData}
            highlightedTeam={highlightedTeam}
            maxRows={maxRows}
        />
    )
}