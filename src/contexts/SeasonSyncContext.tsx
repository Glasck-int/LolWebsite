'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useSimpleSeasonSync } from '@/hooks/useSimpleSeasonSync'
import { SeasonData, useTableEntityStore } from '@/store/tableEntityStore'

interface SeasonSyncContextType {
    selectSeason: (season: string) => void
    selectSplit: (split: string) => void
    selectTournament: (tournament: { id: number; name: string; tournament: string }) => void
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
    const { 
        selectSeason: storeSelectSeason, 
        selectSplit: storeSelectSplit, 
        selectTournament: storeSelectTournament, 
        selectAllSeasons: storeSelectAllSeasons, 
        selectAllSplits: storeSelectAllSplits 
    } = useTableEntityStore()
    
    if (!context) {
        // Return default store methods if no context (for backward compatibility)
        return {
            selectSeason: (season: string) => storeSelectSeason(season, [], false),
            selectSplit: (split: string) => storeSelectSplit(split, [], false),
            selectTournament: storeSelectTournament,
            selectAllSeasons: storeSelectAllSeasons,
            selectAllSplits: storeSelectAllSplits
        }
    }
    return context
}