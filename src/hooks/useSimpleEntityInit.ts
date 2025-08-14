'use client'

import { useEffect, useRef } from 'react'
import { useTableEntityStore, SeasonData } from '@/store/tableEntityStore'
import { 
    getSplits, 
    getTournaments 
} from '@/components/layout/TableEntityLayout/TableEntityLayout'

export const useSimpleEntityInit = (
    seasons: SeasonData[],
    initialSeason?: string,
    initialSplit?: string,
    initialTournament?: string
) => {
    const store = useTableEntityStore()
    const hasInitializedRef = useRef(false)
    const isInitializingRef = useRef(false)
    
    // Only initialize once from URL parameters, don't interfere with navigation
    useEffect(() => {
        console.log('🌐 [URL INIT] useSimpleEntityInit triggered:', {
            hasInit: hasInitializedRef.current,
            seasonsLength: seasons.length,
            isInitializing: isInitializingRef.current,
            initialParams: { initialSeason, initialSplit, initialTournament }
        })
        
        if (!hasInitializedRef.current && seasons.length > 0 && !isInitializingRef.current) {
            // Check if user has already made a manual selection
            if (store.userHasSelectedTournament) {
                console.log('🚫 [URL INIT] User has made manual selection, skipping URL initialization')
                hasInitializedRef.current = true
                isInitializingRef.current = false
                return
            }
            
            console.log('🌐 [URL INIT] Starting URL initialization')
            hasInitializedRef.current = true
            isInitializingRef.current = true
            
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

            // Find target season
            let targetSeason = initialSeason
            let inferredSplit = initialSplit

            // If no season but have tournament, find the season that contains this tournament
            if (!initialSeason && initialTournament) {
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

            // Find the season object and initialize
            const season = seasons.find(s => s.season === targetSeason)
            if (season) {
                store.selectSeason(season.season, seasons, false)

                // Handle split selection
                if (inferredSplit === 'all') {
                    const allId = season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                    store.selectAllSplits(allId)
                    isInitializingRef.current = false // Mark initialization complete
                } else {
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

                    // Handle tournament selection
                    if (initialTournament && initialTournament !== 'all') {
                        const currentSplit = targetSplit || store.activeSplit
                        const tournaments = getTournaments(season.season, currentSplit, seasons, false)
                        const tournament = tournaments.find(t => t.tournament === initialTournament)
                        if (tournament) {
                            store.selectTournament(tournament)
                        }
                    }
                    isInitializingRef.current = false // Mark initialization complete
                }
            } else {
                isInitializingRef.current = false // Mark initialization complete
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seasons, initialSeason, initialSplit, initialTournament])
    
    // Return initialization state for other hooks to use
    return {
        isInitializing: isInitializingRef.current
    }
}