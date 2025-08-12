'use client'

import { useEffect, useRef } from 'react'
import { useQueryString } from '@/lib/hooks/createQueryState'
import { useTableEntityStore, SeasonData, Tournament } from '@/store/tableEntityStore'
import { 
    getSplits, 
    getTournaments 
} from '@/components/layout/TableEntityLayout/TableEntityLayout'

/**
 * Hook that intercepts store methods to add URL synchronization
 * This approach patches the store methods to update URL when called
 */
export const useTableUrlSync = (seasons: SeasonData[]) => {
    const [seasonParam, setSeasonParam] = useQueryString('season', '')
    const [splitParam, setSplitParam] = useQueryString('split', '')
    const [tournamentParam, setTournamentParam] = useQueryString('tournament', '')
    
    const store = useTableEntityStore()
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

    // Initialize from URL on mount - with a delay to ensure store is ready
    useEffect(() => {
        if (!hasInitializedRef.current && seasons.length > 0) {
            // Small delay to ensure store has initialized with defaults
            const timer = setTimeout(() => {
                hasInitializedRef.current = true
                isInternalUpdateRef.current = true
            
            // Handle "all seasons" case
            if (seasonParam === 'all') {
                const allId = seasons.flatMap(season =>
                    season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                )
                originalMethods.selectAllSeasons(allId)
            } else {
                // Determine which season to use
                let targetSeason = seasonParam
                let inferredSplit = splitParam // Track inferred split
                
                // If no season param, check if we have a tournament param
                // If we have tournament but no season, we need to find the season
                if (!seasonParam && tournamentParam) {
                    // Find the season that contains this tournament
                    for (const season of seasons) {
                        for (const split of season.data) {
                            const hasTourn = split.tournaments?.some(t => t.tournament === tournamentParam)
                            if (hasTourn) {
                                targetSeason = season.season
                                // Also remember the split for later
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
                        if (!inferredSplit && tournamentParam) {
                            for (const split of season.data) {
                                const hasTourn = split.tournaments?.some(t => t.tournament === tournamentParam)
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
                        if (tournamentParam && tournamentParam !== 'all') {
                            // Need to wait a bit for split to be set
                            setTimeout(() => {
                                const currentSplit = targetSplit || store.activeSplit
                                const tournaments = getTournaments(season.season, currentSplit, seasons, false)
                                const tournament = tournaments.find(t => t.tournament === tournamentParam)
                                if (tournament) {
                                    originalMethods.selectTournament(tournament)
                                }
                            }, 50)
                        }
                    }
                }
            }
            
                setTimeout(() => {
                    isInternalUpdateRef.current = false
                }, 200)
            }, 150) // Delay initialization
            
            return () => clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seasonParam, splitParam, tournamentParam, seasons, store.activeSplit])

    // Patch store methods to add URL sync
    useEffect(() => {
        // Override selectSeason
        useTableEntityStore.setState({
            selectSeason: (season: string, seasonsData: SeasonData[], isAllActive: boolean) => {
                originalMethods.selectSeason(season, seasonsData, isAllActive)
                if (!isInternalUpdateRef.current) {
                    setSeasonParam(season)
                    setSplitParam('')
                    setTournamentParam('')
                }
            }
        })
        
        // Override selectSplit
        useTableEntityStore.setState({
            selectSplit: (split: string, seasonsData: SeasonData[], isAllActive: boolean) => {
                originalMethods.selectSplit(split, seasonsData, isAllActive)
                if (!isInternalUpdateRef.current) {
                    setSplitParam(split)
                    setTournamentParam('')
                }
            }
        })
        
        // Override selectTournament
        useTableEntityStore.setState({
            selectTournament: (tournament: Tournament) => {
                originalMethods.selectTournament(tournament)
                if (!isInternalUpdateRef.current) {
                    setTournamentParam(tournament.tournament)
                }
            }
        })
        
        // Override selectAllSeasons
        useTableEntityStore.setState({
            selectAllSeasons: (allId: number[]) => {
                originalMethods.selectAllSeasons(allId)
                if (!isInternalUpdateRef.current) {
                    setSeasonParam('all')
                    setSplitParam('')
                    setTournamentParam('')
                }
            }
        })
        
        // Override selectAllSplits
        useTableEntityStore.setState({
            selectAllSplits: (allId: number[]) => {
                originalMethods.selectAllSplits(allId)
                if (!isInternalUpdateRef.current) {
                    setSplitParam('all')
                    setTournamentParam('')
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
    }, [setSeasonParam, setSplitParam, setTournamentParam])

    // Sync store changes to URL
    useEffect(() => {
        if (!hasInitializedRef.current || isInternalUpdateRef.current || seasons.length === 0) {
            return
        }

        // Update URL based on current store state
        if (store.activeAllSeason) {
            if (seasonParam !== 'all') {
                setSeasonParam('all')
                setSplitParam('')
                setTournamentParam('')
            }
        } else if (store.activeAllSplit) {
            if (splitParam !== 'all' || seasonParam !== store.activeHeaderSeason) {
                setSeasonParam(store.activeHeaderSeason || '')
                setSplitParam('all')
                setTournamentParam('')
            }
        } else {
            // Normal selection - update all params if different
            const newSeason = store.activeHeaderSeason || ''
            const newSplit = store.activeSplit || ''
            const newTournament = store.activeTournament || ''
            
            if (newSeason !== seasonParam) {
                setSeasonParam(newSeason)
            }
            if (newSplit !== splitParam) {
                setSplitParam(newSplit)
            }
            if (newTournament !== tournamentParam) {
                setTournamentParam(newTournament)
            }
        }
    }, [
        store.activeHeaderSeason, 
        store.activeSplit, 
        store.activeTournament, 
        store.activeAllSeason, 
        store.activeAllSplit,
        seasonParam,
        splitParam,
        seasons.length,
        tournamentParam,
        setSeasonParam,
        setSplitParam,
        setTournamentParam
    ])
}