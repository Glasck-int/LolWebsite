'use client'

import { useEffect, useRef } from 'react'
import { useQueryString } from '@/lib/hooks/createQueryState'
import { useTableEntityStore, SeasonData } from '@/store/tableEntityStore'
import { 
    getSplits, 
    getTournaments 
} from '@/components/layout/TableEntityLayout/TableEntityLayout'

/**
 * Hook for synchronizing table entity selection (season, split, tournament) with URL
 * Uses the createQueryState utility for clean URL management
 */
export const useTableEntityUrlSync = (seasons: SeasonData[]) => {
    const [seasonParam, setSeasonParam] = useQueryString('season', '')
    const [splitParam, setSplitParam] = useQueryString('split', '')
    const [tournamentParam, setTournamentParam] = useQueryString('tournament', '')
    
    const {
        activeHeaderSeason,
        activeSplit,
        activeTournament,
        activeAllSeason,
        activeAllSplit,
        selectSeason,
        selectSplit,
        selectTournament,
        selectAllSeasons,
        selectAllSplits,
        activeId
    } = useTableEntityStore()
    
    const isInitializedRef = useRef(false)
    const isUpdatingRef = useRef(false)
    const isUpdatingFromStoreRef = useRef(false)

    // Initialize from URL on mount
    useEffect(() => {
        if (!isInitializedRef.current && seasons.length > 0) {
            isInitializedRef.current = true
            isUpdatingRef.current = true

            // Handle "all seasons" case
            if (seasonParam === 'all') {
                const allId = seasons.flatMap(season =>
                    season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                )
                selectAllSeasons(allId)
                setTimeout(() => {
                    isUpdatingRef.current = false
                }, 100)
                return
            }

            // Find and set season
            const season = seasons.find(s => s.season === seasonParam)
            const targetSeason = season?.season || seasons[seasons.length - 1].season
            
            // Handle "all splits" case
            if (splitParam === 'all' && season) {
                const allId = season.data.flatMap(split =>
                    split.tournaments?.map(t => t.id) || []
                )
                selectAllSplits(allId)
                isUpdatingRef.current = false
                return
            }

            // Set specific season/split/tournament
            if (seasonParam && season) {
                selectSeason(targetSeason, seasons, false)
                
                if (splitParam) {
                    const splits = getSplits(targetSeason, seasons)
                    if (splits.includes(splitParam)) {
                        selectSplit(splitParam, seasons, false)
                        
                        if (tournamentParam) {
                            const tournaments = getTournaments(targetSeason, splitParam, seasons, false)
                            
                            if (tournamentParam === 'all') {
                                const allId = tournaments.map(t => t.id)
                                selectAllSplits(allId)
                            } else {
                                const tournament = tournaments.find(t => t.tournament === tournamentParam)
                                if (tournament) {
                                    selectTournament(tournament)
                                }
                            }
                        }
                    }
                }
            }
            
            isUpdatingRef.current = false
        }
    }, [seasonParam, splitParam, tournamentParam, seasons, selectSeason, selectSplit, selectTournament, selectAllSeasons, selectAllSplits])

    // Sync from store to URL when selection changes
    useEffect(() => {
        if (isUpdatingRef.current || !isInitializedRef.current) {
            return
        }

        isUpdatingFromStoreRef.current = true

        // Handle special "all" cases
        if (activeAllSeason) {
            setSeasonParam('all')
            setSplitParam('')
            setTournamentParam('')
        } else if (activeAllSplit) {
            setSeasonParam(activeHeaderSeason)
            setSplitParam('all')
            setTournamentParam('')
        } else {
            // Normal selection
            setSeasonParam(activeHeaderSeason || '')
            setSplitParam(activeSplit || '')
            
            if (activeTournament) {
                if (activeTournament === 'All') {
                    setTournamentParam('all')
                } else {
                    setTournamentParam(activeTournament)
                }
            } else {
                setTournamentParam('')
            }
        }

        isUpdatingFromStoreRef.current = false
    }, [
        activeHeaderSeason,
        activeSplit,
        activeTournament,
        activeAllSeason,
        activeAllSplit,
        setSeasonParam,
        setSplitParam,
        setTournamentParam,
        activeId
    ])

    // Handle URL param changes (browser back/forward)
    useEffect(() => {
        if (isUpdatingFromStoreRef.current || !isInitializedRef.current || seasons.length === 0) {
            return
        }

        isUpdatingRef.current = true

        // Re-sync from URL when params change externally
        if (seasonParam === 'all') {
            const allId = seasons.flatMap(season =>
                season.data.flatMap(split =>
                    split.tournaments?.map(t => t.id) || []
                )
            )
            selectAllSeasons(allId)
        } else if (seasonParam) {
            const season = seasons.find(s => s.season === seasonParam)
            if (season) {
                selectSeason(season.season, seasons, false)
                
                if (splitParam === 'all') {
                    const allId = season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                    selectAllSplits(allId)
                } else if (splitParam) {
                    selectSplit(splitParam, seasons, false)
                    
                    if (tournamentParam) {
                        const tournaments = getTournaments(season.season, splitParam, seasons, false)
                        if (tournamentParam === 'all') {
                            const allId = tournaments.map(t => t.id)
                            selectAllSplits(allId)
                        } else {
                            const tournament = tournaments.find(t => t.tournament === tournamentParam)
                            if (tournament) {
                                selectTournament(tournament)
                            }
                        }
                    }
                }
            }
        }

        isUpdatingRef.current = false
    }, [seasonParam, splitParam, tournamentParam, seasons, selectSeason, selectSplit, selectTournament, selectAllSeasons, selectAllSplits])
}