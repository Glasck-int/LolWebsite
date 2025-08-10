'use client'

import React, { createContext, useContext } from 'react'
import { ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'
import { MatchScheduleGame, Standings } from '@/generated/prisma'
import { PlayerStatsType } from '@glasck-int/glasck-types'

// Types flexibles pour accepter les données de l'API

interface TournamentContextType {
    standings: Standings[]
    playerStats: PlayerStatsType[]
    tournamentName: string
    enrichedStandingsData?: ProcessedStanding[]
    enrichedGamesData?: MatchScheduleGame[]
    Images?: Record<string, { playerImage: string, teamImage: string }>
}

// Créer le context
const TournamentContext = createContext<TournamentContextType | null>(null)

// Hook personnalisé pour utiliser le context
export const useTournament = () => {
    const context = useContext(TournamentContext)
    if (!context) {
        throw new Error(
            'useTournament doit être utilisé dans un TournamentProvider'
        )
    }
    return context
}

// Provider component
interface TournamentProviderProps {
    children: React.ReactNode
    standings: Standings[]
    playerStats: PlayerStatsType[]
    tournamentName: string
    enrichedStandingsData?: ProcessedStanding[]
    enrichedGamesData?: MatchScheduleGame[]
    Images?: Record<string, { playerImage: string, teamImage: string }>
}

export const TournamentProvider = ({
    children,
    standings,
    playerStats,
    tournamentName,
    enrichedStandingsData,
    enrichedGamesData,
    Images,
}: TournamentProviderProps) => {
    const value: TournamentContextType = {
        standings,
        playerStats,
        tournamentName,
        enrichedStandingsData,
        enrichedGamesData,
        Images,
    }

    return (
        <TournamentContext.Provider value={value}>
            {children}
        </TournamentContext.Provider>
    )
}
