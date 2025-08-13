'use client'

import { useEffect, useRef } from 'react'
import { useTableEntityStore, SeasonData, Tournament } from '@/store/tableEntityStore'
import { useEntityNavigation } from './useEntityNavigation'
import { 
    getSplits, 
    getTournaments 
} from '@/components/layout/TableEntityLayout/TableEntityLayout'

export const useEntityUrlSync = (
    seasons: SeasonData[],
    initialSeason?: string,
    initialSplit?: string,
    initialTournament?: string
) => {
    const store = useTableEntityStore()
    const { navigateToSeason, navigateToSplit, navigateToTournament } = useEntityNavigation()
    const hasInitializedRef = useRef(false)
    const isInternalUpdateRef = useRef(false)
    
    // Store original methods once on mount to prevent infinite loops
    const originalMethodsRef = useRef<{
        selectSeason: typeof store.selectSeason
        selectSplit: typeof store.selectSplit
        selectTournament: typeof store.selectTournament
        selectAllSeasons: typeof store.selectAllSeasons
        selectAllSplits: typeof store.selectAllSplits
    } | null>(null)
    
    // Capture original methods only once
    if (!originalMethodsRef.current) {
        originalMethodsRef.current = {
            selectSeason: store.selectSeason,
            selectSplit: store.selectSplit,
            selectTournament: store.selectTournament,
            selectAllSeasons: store.selectAllSeasons,
            selectAllSplits: store.selectAllSplits
        }
    }
    
    const originalMethods = originalMethodsRef.current

    // Initialize from URL on mount
    useEffect(() => {
        if (!hasInitializedRef.current && seasons.length > 0) {
            hasInitializedRef.current = true
            isInternalUpdateRef.current = true
            
            // Handle "all seasons" case
            if (initialSeason === 'all') {
                const allId = seasons.flatMap(season =>
                    season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                )
                originalMethods.selectAllSeasons(allId)
                isInternalUpdateRef.current = false
                return
            }

            // Determine which season to use
            let targetSeason = initialSeason
            let inferredSplit = initialSplit

            // If no season param, check if we have a tournament param
            if (!initialSeason && initialTournament) {
                // Find the season that contains this tournament
                for (const season of seasons) {
                    for (const split of season.data) {
                        const hasTourn = split.tournaments?.some(t => t.tournament === initialTournament)
                        if (hasTourn) {
                            targetSeason = season.season
                            if (!inferredSplit) {
                                inferredSplit = split.split || ''
                            }
                            break
                        }
                    }
                    if (targetSeason) break
                }
            }

            // If still no season, use the latest
            if (!targetSeason) {
                targetSeason = seasons[seasons.length - 1].season
            }

            // Find the season object
            const season = seasons.find(s => s.season === targetSeason)
            if (season) {
                originalMethods.selectSeason(season.season, seasons, false)

                // Handle split
                if (inferredSplit === 'all') {
                    const allId = season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                    originalMethods.selectAllSplits(allId)
                } else {
                    // Determine target split
                    let targetSplit = inferredSplit

                    // If no split but have tournament, find the split
                    if (!inferredSplit && initialTournament) {
                        for (const split of season.data) {
                            const hasTourn = split.tournaments?.some(t => t.tournament === initialTournament)
                            if (hasTourn) {
                                targetSplit = split.split || ''
                                break
                            }
                        }
                    }

                    if (targetSplit) {
                        const splits = getSplits(season.season, seasons)
                        if (splits.includes(targetSplit)) {
                            originalMethods.selectSplit(targetSplit, seasons, false)
                        }
                    }

                    // Handle tournament
                    if (initialTournament && initialTournament !== 'all') {
                        setTimeout(() => {
                            const currentSplit = targetSplit || store.activeSplit
                            const tournaments = getTournaments(season.season, currentSplit, seasons, false)
                            const tournament = tournaments.find(t => t.tournament === initialTournament)
                            if (tournament) {
                                originalMethods.selectTournament(tournament)
                            }
                        }, 50)
                    }
                }
            }
            
            setTimeout(() => {
                isInternalUpdateRef.current = false
            }, 200)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seasons, initialSeason, initialSplit, initialTournament])

    // Patch store methods to add URL navigation
    useEffect(() => {
        // Override selectSeason to use navigation
        useTableEntityStore.setState({
            selectSeason: (season: string, seasonsData: SeasonData[], isAllActive: boolean) => {
                if (!isInternalUpdateRef.current) {
                    navigateToSeason(season, seasonsData, isAllActive)
                } else {
                    originalMethods.selectSeason(season, seasonsData, isAllActive)
                }
            }
        })
        
        // Override selectSplit to use navigation
        useTableEntityStore.setState({
            selectSplit: (split: string, seasonsData: SeasonData[], isAllActive: boolean) => {
                if (!isInternalUpdateRef.current) {
                    navigateToSplit(split, seasonsData, isAllActive)
                } else {
                    originalMethods.selectSplit(split, seasonsData, isAllActive)
                }
            }
        })
        
        // Override selectTournament to use navigation
        useTableEntityStore.setState({
            selectTournament: (tournament: Tournament) => {
                if (!isInternalUpdateRef.current) {
                    navigateToTournament(tournament)
                } else {
                    originalMethods.selectTournament(tournament)
                }
            }
        })
        
        // Override selectAllSeasons
        useTableEntityStore.setState({
            selectAllSeasons: (allId: number[]) => {
                originalMethods.selectAllSeasons(allId)
                if (!isInternalUpdateRef.current) {
                    // Navigate to base URL without season segments
                    navigateToSeason('all', seasons, true)
                }
            }
        })
        
        // Override selectAllSplits
        useTableEntityStore.setState({
            selectAllSplits: (allId: number[]) => {
                originalMethods.selectAllSplits(allId)
                if (!isInternalUpdateRef.current) {
                    // Navigate with season but without split segments
                    navigateToSplit('all', seasons, true)
                }
            }
        })
        
        // Cleanup: restore original methods on unmount
        return () => {
            useTableEntityStore.setState({
                selectSeason: originalMethods.selectSeason,
                selectSplit: originalMethods.selectSplit,
                selectTournament: originalMethods.selectTournament,
                selectAllSeasons: originalMethods.selectAllSeasons,
                selectAllSplits: originalMethods.selectAllSplits
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigateToSeason, navigateToSplit, navigateToTournament, seasons])
}