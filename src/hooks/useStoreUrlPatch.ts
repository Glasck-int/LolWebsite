'use client'

import { useEffect, useRef } from 'react'
import { useTableEntityStore, SeasonData, Tournament } from '@/store/tableEntityStore'
import { useManualUrlSync } from './useManualUrlSync'

export const useStoreUrlPatch = () => {
    const store = useTableEntityStore()
    const { syncUrl } = useManualUrlSync()
    const originalMethodsRef = useRef<{
        selectSeason: typeof store.selectSeason
        selectSplit: typeof store.selectSplit
        selectTournament: typeof store.selectTournament
        selectAllSeasons: typeof store.selectAllSeasons
        selectAllSplits: typeof store.selectAllSplits
    } | null>(null)
    
    // Capture original methods only once
    useEffect(() => {
        if (originalMethodsRef.current) return

        originalMethodsRef.current = {
            selectSeason: store.selectSeason,
            selectSplit: store.selectSplit,
            selectTournament: store.selectTournament,
            selectAllSeasons: store.selectAllSeasons,
            selectAllSplits: store.selectAllSplits
        }

        const originalMethods = originalMethodsRef.current

        // Override store methods to add URL sync AFTER the store update
        useTableEntityStore.setState({
            selectSeason: (season: string, seasonsData: SeasonData[], isAllActive: boolean) => {
                console.log('🔄 PATCHED selectSeason called:', season)
                originalMethods.selectSeason(season, seasonsData, isAllActive)
                setTimeout(() => {
                    console.log('📡 Syncing URL after selectSeason')
                    syncUrl()
                }, 100)
            },
            
            selectSplit: (split: string, seasonsData: SeasonData[], isAllActive: boolean) => {
                console.log('🔄 PATCHED selectSplit called:', split)
                originalMethods.selectSplit(split, seasonsData, isAllActive)
                setTimeout(() => {
                    console.log('📡 Syncing URL after selectSplit')
                    syncUrl()
                }, 100)
            },
            
            selectTournament: (tournament: Tournament) => {
                console.log('🔄 PATCHED selectTournament called:', tournament.tournament)
                originalMethods.selectTournament(tournament)
                setTimeout(() => {
                    console.log('📡 Syncing URL after selectTournament')
                    syncUrl()
                }, 100)
            },
            
            selectAllSeasons: (allId: number[]) => {
                originalMethods.selectAllSeasons(allId)
                setTimeout(() => syncUrl(), 100)
            },
            
            selectAllSplits: (allId: number[]) => {
                originalMethods.selectAllSplits(allId)
                setTimeout(() => syncUrl(), 100)
            }
        })

        // Cleanup function
        return () => {
            if (originalMethodsRef.current) {
                useTableEntityStore.setState({
                    selectSeason: originalMethodsRef.current.selectSeason,
                    selectSplit: originalMethodsRef.current.selectSplit,
                    selectTournament: originalMethodsRef.current.selectTournament,
                    selectAllSeasons: originalMethodsRef.current.selectAllSeasons,
                    selectAllSplits: originalMethodsRef.current.selectAllSplits
                })
            }
        }
    }, [syncUrl])
}