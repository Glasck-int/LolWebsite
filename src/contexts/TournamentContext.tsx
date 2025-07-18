'use client'

import React, { createContext, useContext } from 'react'
import { ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'

// Types (tu peux les importer depuis tes types existants)
interface StandingsData {
    // Définis tes types de standings ici
    [key: string]: any
}

interface PlayerStats {
    name: string
    team: string
    role: string
    gamesPlayed: number
    avgKills: number
    avgDeaths: number
    avgAssists: number
    kda: number
    totalKills: number
    totalDeaths: number
    totalAssists: number
    avgDamage: number
    avgGold: number
    avgCS: number
    avgVisionScore: number
    winRate: number
}

interface TournamentContextType {
    standings: StandingsData[]
    playerStats: PlayerStats[]
    tournamentName: string
    enrichedStandingsData?: ProcessedStanding[]
    enrichedGamesData?: any[]
}

// Créer le context
const TournamentContext = createContext<TournamentContextType | null>(null)

// Hook personnalisé pour utiliser le context
export const useTournament = () => {
    const context = useContext(TournamentContext)
    if (!context) {
        throw new Error('useTournament doit être utilisé dans un TournamentProvider')
    }
    return context
}

// Provider component
interface TournamentProviderProps {
    children: React.ReactNode
    standings: StandingsData[]
    playerStats: PlayerStats[]
    tournamentName: string
    enrichedStandingsData?: ProcessedStanding[]
    enrichedGamesData?: any[]
}

export const TournamentProvider = ({
    children,
    standings,
    playerStats,
    tournamentName,
    enrichedStandingsData,
    enrichedGamesData
}: TournamentProviderProps) => {
    const value: TournamentContextType = {
        standings,
        playerStats,
        tournamentName,
        enrichedStandingsData,
        enrichedGamesData
    }

    return (
        <TournamentContext.Provider value={value}>
            {children}
        </TournamentContext.Provider>
    )
}