'use client'

import { useEffect, useRef } from 'react'
import { useQueryString } from '@/lib/hooks/createQueryState'
import { useTableEntityStore, SeasonData } from '@/store/tableEntityStore'
import { 
    getSplits, 
    getTournaments 
} from '@/components/layout/TableEntityLayout/TableEntityLayout'

/**
 * Simplified hook for season/split/tournament URL synchronization
 * Only syncs on initial mount and when user makes selections
 * Also wraps the store methods to add URL sync
 */
export const useSimpleSeasonSync = (seasons: SeasonData[]) => {
    const [seasonParam, setSeasonParam] = useQueryString('season', '')
    const [splitParam, setSplitParam] = useQueryString('split', '')
    const [tournamentParam, setTournamentParam] = useQueryString('tournament', '')
    
    const {
        activeHeaderSeason,
        activeSplit,
        activeTournament,
        activeAllSeason,
        activeAllSplit,
        selectSeason: storeSelectSeason,
        selectSplit: storeSelectSplit,
        selectTournament: storeSelectTournament,
        selectAllSeasons: storeSelectAllSeasons,
        selectAllSplits: storeSelectAllSplits,
    } = useTableEntityStore()
    
    const hasInitializedRef = useRef(false)
    const isInternalUpdateRef = useRef(false)

    // Initialize from URL on mount only
    useEffect(() => {
        if (!hasInitializedRef.current && seasons.length > 0) {
            hasInitializedRef.current = true
            
            // Handle "all seasons" case
            if (seasonParam === 'all') {
                const allId = seasons.flatMap(season =>
                    season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                )
                storeSelectAllSeasons(allId)
                return
            }

            // Handle specific season
            if (seasonParam) {
                const season = seasons.find(s => s.season === seasonParam)
                if (season) {
                    isInternalUpdateRef.current = true
                    storeSelectSeason(season.season, seasons, false)
                    
                    // Handle split
                    if (splitParam === 'all') {
                        const allId = season.data.flatMap(split =>
                            split.tournaments?.map(t => t.id) || []
                        )
                        storeSelectAllSplits(allId)
                    } else if (splitParam) {
                        const splits = getSplits(season.season, seasons)
                        if (splits.includes(splitParam)) {
                            storeSelectSplit(splitParam, seasons, false)
                            
                            // Handle tournament
                            if (tournamentParam && tournamentParam !== 'all') {
                                const tournaments = getTournaments(season.season, splitParam, seasons, false)
                                const tournament = tournaments.find(t => t.tournament === tournamentParam)
                                if (tournament) {
                                    storeSelectTournament(tournament)
                                }
                            }
                        }
                    }
                    
                    setTimeout(() => {
                        isInternalUpdateRef.current = false
                    }, 100)
                }
            }
        }
    }, [seasonParam, splitParam, tournamentParam, seasons, storeSelectAllSeasons, storeSelectAllSplits, storeSelectSeason, storeSelectSplit, storeSelectTournament]) // Only on mount and when seasons load

    // Update URL when store changes (but not during initialization)
    useEffect(() => {
        if (!hasInitializedRef.current || isInternalUpdateRef.current || seasons.length === 0) {
            return
        }

        // Update URL based on current selection
        if (activeAllSeason) {
            setSeasonParam('all')
            setSplitParam('')
            setTournamentParam('')
        } else if (activeAllSplit) {
            setSeasonParam(activeHeaderSeason || '')
            setSplitParam('all')
            setTournamentParam('')
        } else {
            setSeasonParam(activeHeaderSeason || '')
            setSplitParam(activeSplit || '')
            setTournamentParam(activeTournament || '')
        }
    }, [activeHeaderSeason, activeSplit, activeTournament, activeAllSeason, activeAllSplit, seasons.length, setSeasonParam, setSplitParam, setTournamentParam])

    // Provide methods that update both store and URL
    const selectSeason = (season: string) => {
        isInternalUpdateRef.current = true
        storeSelectSeason(season, seasons, false)
        setSeasonParam(season)
        setSplitParam('')
        setTournamentParam('')
        setTimeout(() => {
            isInternalUpdateRef.current = false
        }, 100)
    }

    const selectSplit = (split: string) => {
        isInternalUpdateRef.current = true
        storeSelectSplit(split, seasons, false)
        setSplitParam(split)
        setTournamentParam('')
        setTimeout(() => {
            isInternalUpdateRef.current = false
        }, 100)
    }

    const selectTournament = (tournament: { id: number; name: string; tournament: string }) => {
        isInternalUpdateRef.current = true
        storeSelectTournament(tournament)
        setTournamentParam(tournament.tournament)
        setTimeout(() => {
            isInternalUpdateRef.current = false
        }, 100)
    }

    const selectAllSeasons = (allId: number[]) => {
        isInternalUpdateRef.current = true
        storeSelectAllSeasons(allId)
        setSeasonParam('all')
        setSplitParam('')
        setTournamentParam('')
        setTimeout(() => {
            isInternalUpdateRef.current = false
        }, 100)
    }

    const selectAllSplits = (allId: number[]) => {
        isInternalUpdateRef.current = true
        storeSelectAllSplits(allId)
        setSplitParam('all')
        setTournamentParam('')
        setTimeout(() => {
            isInternalUpdateRef.current = false
        }, 100)
    }

    return {
        selectSeason,
        selectSplit,
        selectTournament,
        selectAllSeasons,
        selectAllSplits
    }
}