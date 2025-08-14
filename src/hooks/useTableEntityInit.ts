'use client'

import { useEffect, useRef } from 'react'
import { useTableEntityStore, SeasonData } from '@/store/tableEntityStore'
import { 
    getSplits, 
    getTournaments 
} from '@/components/layout/TableEntityLayout/TableEntityLayout'

export const useTableEntityInit = (
    seasons: SeasonData[],
    initialSeason?: string,
    initialSplit?: string,
    initialTournament?: string
) => {
    const store = useTableEntityStore()
    const hasInitializedRef = useRef(false)
    
    useEffect(() => {
        if (!hasInitializedRef.current && seasons.length > 0) {
            hasInitializedRef.current = true
            
            // Handle "all seasons" case
            if (initialSeason === 'all') {
                const allId = seasons.flatMap(season =>
                    season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                )
                store.selectAllSeasons(allId)
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
                store.selectSeason(season.season, seasons, false)

                // Handle split
                if (inferredSplit === 'all') {
                    const allId = season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                    store.selectAllSplits(allId)
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
                            store.selectSplit(targetSplit, seasons, false)
                        }
                    }

                    // Handle tournament
                    if (initialTournament && initialTournament !== 'all') {
                        const currentSplit = targetSplit || store.activeSplit
                        const tournaments = getTournaments(season.season, currentSplit, seasons, false)
                        const tournament = tournaments.find(t => t.tournament === initialTournament)
                        if (tournament) {
                            store.selectTournament(tournament)
                        }
                    }
                }
            }
        }
    }, [seasons, initialSeason, initialSplit, initialTournament, store])
}