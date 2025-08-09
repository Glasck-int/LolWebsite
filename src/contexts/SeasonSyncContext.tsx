'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useSimpleSeasonSync } from '@/hooks/useSimpleSeasonSync'
import { SeasonData } from '@/store/tableEntityStore'

interface SeasonSyncContextType {
    selectSeason: (season: string) => void
    selectSplit: (split: string) => void
    selectTournament: (tournament: any) => void
    selectAllSeasons: (allId: number[]) => void
    selectAllSplits: (allId: number[]) => void
}

const SeasonSyncContext = createContext<SeasonSyncContextType | null>(null)

interface SeasonSyncProviderProps {
    children: ReactNode
    seasons: SeasonData[]
}

export const SeasonSyncProvider = ({ children, seasons }: SeasonSyncProviderProps) => {
    const syncMethods = useSimpleSeasonSync(seasons)
    
    return (
        <SeasonSyncContext.Provider value={syncMethods}>
            {children}
        </SeasonSyncContext.Provider>
    )
}

export const useSeasonSync = () => {
    const context = useContext(SeasonSyncContext)
    if (!context) {
        // Return default store methods if no context (for backward compatibility)
        const { 
            selectSeason, 
            selectSplit, 
            selectTournament, 
            selectAllSeasons, 
            selectAllSplits 
        } = require('@/store/tableEntityStore').useTableEntityStore()
        
        return {
            selectSeason: (season: string) => selectSeason(season, [], false),
            selectSplit: (split: string) => selectSplit(split, [], false),
            selectTournament,
            selectAllSeasons,
            selectAllSplits
        }
    }
    return context
}