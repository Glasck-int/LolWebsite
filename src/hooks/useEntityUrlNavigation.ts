'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTableEntityStore, SeasonData } from '@/store/tableEntityStore'
import { 
    getSplits, 
    getTournaments 
} from '@/components/layout/TableEntityLayout/TableEntityLayout'

export const useEntityUrlNavigation = (
    seasons: SeasonData[],
    initialSeason?: string,
    initialSplit?: string,
    initialTournament?: string
) => {
    const router = useRouter()
    const pathname = usePathname()
    const store = useTableEntityStore()
    const hasInitializedRef = useRef(false)
    const isNavigatingRef = useRef(false)
    
    // Extract entity info from URL
    const getEntityInfo = () => {
        const segments = pathname.split('/').filter(Boolean)
        const hasLocale = segments.length >= 2 && segments[0].length === 2
        const startIndex = hasLocale ? 1 : 0
        
        if (segments.length < startIndex + 2) return null
        
        const entityType = segments[startIndex]
        const entityName = segments[startIndex + 1]
        
        return { entityType, entityName, hasLocale, localePrefix: hasLocale ? `/${segments[0]}` : '' }
    }

    // Navigate to new URL format
    const navigateToSegmentUrl = useCallback((season?: string, split?: string, tournament?: string) => {
        if (isNavigatingRef.current) return // Prevent navigation loops
        
        const entityInfo = getEntityInfo()
        if (!entityInfo) return

        const { entityType, entityName, localePrefix } = entityInfo
        
        let newPath = `${localePrefix}/${entityType}/${entityName}`
        
        if (season && season !== 'all') {
            newPath += `/${season}`
            if (split && split !== 'all') {
                newPath += `/${split}`
                if (tournament && tournament !== 'all') {
                    newPath += `/${tournament}`
                }
            }
        }

        // Check if we actually need to navigate
        if (pathname !== newPath) {
            isNavigatingRef.current = true
            router.push(newPath)
            
            // Reset navigation flag after a short delay
            setTimeout(() => {
                isNavigatingRef.current = false
            }, 1000)
        }
    }, [router, pathname])

    // Initialize from URL parameters on mount
    useEffect(() => {
        if (!hasInitializedRef.current && seasons.length > 0 && !isNavigatingRef.current) {
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

            // Find target season
            let targetSeason = initialSeason
            let inferredSplit = initialSplit

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

            if (!targetSeason) {
                targetSeason = seasons[seasons.length - 1].season
            }

            const season = seasons.find(s => s.season === targetSeason)
            if (season) {
                store.selectSeason(season.season, seasons, false)

                if (inferredSplit === 'all') {
                    const allId = season.data.flatMap(split =>
                        split.tournaments?.map(t => t.id) || []
                    )
                    store.selectAllSplits(allId)
                } else {
                    let targetSplit = inferredSplit

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

                    if (initialTournament && initialTournament !== 'all') {
                        setTimeout(() => {
                            const currentSplit = targetSplit || store.activeSplit
                            const tournaments = getTournaments(season.season, currentSplit, seasons, false)
                            const tournament = tournaments.find(t => t.tournament === initialTournament)
                            if (tournament) {
                                store.selectTournament(tournament)
                            }
                        }, 50)
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seasons, initialSeason, initialSplit, initialTournament])

    // Listen to store changes and navigate accordingly (but not during initialization)
    const lastStoreState = useRef({
        season: store.activeHeaderSeason,
        split: store.activeSplit,
        tournament: store.activeTournament,
        allSeason: store.activeAllSeason,
        allSplit: store.activeAllSplit
    })

    useEffect(() => {
        // Don't navigate if we're still initializing
        if (!hasInitializedRef.current) return
        
        // Check if the store state actually changed (avoid loops)
        const currentState = {
            season: store.activeHeaderSeason,
            split: store.activeSplit,
            tournament: store.activeTournament,
            allSeason: store.activeAllSeason,
            allSplit: store.activeAllSplit
        }

        const hasChanged = JSON.stringify(currentState) !== JSON.stringify(lastStoreState.current)
        if (!hasChanged) return

        lastStoreState.current = currentState

        // Navigate with a small delay to avoid conflicts
        const timer = setTimeout(() => {
            if (currentState.allSeason) {
                navigateToSegmentUrl()
            } else if (currentState.allSplit) {
                navigateToSegmentUrl(currentState.season)
            } else {
                navigateToSegmentUrl(
                    currentState.season,
                    currentState.split,
                    currentState.tournament
                )
            }
        }, 150)

        return () => clearTimeout(timer)
    }, [
        store.activeHeaderSeason,
        store.activeSplit,
        store.activeTournament,
        store.activeAllSeason,
        store.activeAllSplit,
        navigateToSegmentUrl
    ])

    return { navigateToSegmentUrl }
}