// store/tableEntityStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
    getSplits,
    getTournaments,
} from '@/components/layout/TableEntityLayout/TableEntityLayout'
import { createCacheHelpers, CacheItem } from '@/lib/cacheUtils'

// Generic tab interface for reusability across different components
export interface TabConfig {
    index: number
    name: string
    displayName: string
}

// Types pour le store
export interface Tournament {
    tournament: string
    id: number
    allId?: number[]
}

export interface Split {
    split?: string
    tournaments: Tournament[]
}

export interface SeasonData {
    season: string
    data: Split[]
}

// Types for cached data
type CachedSeasonData = SeasonData[]


// Interface du store principal
interface TableEntityState {
    activeIndex: number
    activeTabIndex: number
    activeId: number[]
    activeSplit: string
    activeTournament: string
    activeAllSeason: boolean
    activeAllSplit: boolean
    activeHeaderSeason: string

    // Track if user has manually selected a tournament to prevent auto-overrides
    userHasSelectedTournament: boolean

    // Tab configuration set by components
    tabConfigs: TabConfig[]

    // Cache des saisons par leagueId
    seasonsCache: Record<number, CacheItem<CachedSeasonData>>
    cacheTimeout: number

    setActiveIndex: (index: number) => void
    setActiveTabIndex: (index: number) => void
    setActiveId: (id: number[]) => void
    setActiveSplit: (split: string) => void
    setActiveTournament: (tournament: string) => void
    setActiveAllSeason: (all: boolean) => void
    setActiveAllSplit: (all: boolean) => void
    setActiveHeaderSeason: (season: string) => void

    /**
     * Tab management methods - Auto-detection
     */
    registerTab: (index: number, displayName: string) => void
    unregisterTab: (index: number) => void
    getTabName: (index: number) => string
    getTabIndex: (name: string) => number
    setActiveTab: (index: number) => void
    getActiveTabIndex: () => number

    // Cache methods for seasons
    getCachedSeasons: (leagueId: number) => CacheItem<CachedSeasonData> | null
    setCachedSeasons: (leagueId: number, data: CachedSeasonData) => void
    setSeasonsLoading: (leagueId: number, loading: boolean) => void
    setSeasonsError: (leagueId: number, error: string | null) => void
    
    
    clearExpiredCache: () => void

    initializeWithSeasons: (seasons: SeasonData[], isAllActive: boolean) => void
    selectSeason: (
        season: string,
        seasons: SeasonData[],
        isAllActive: boolean
    ) => void
    selectSplit: (
        split: string,
        seasons: SeasonData[],
        isAllActive: boolean
    ) => void
    selectTournament: (tournament: Tournament) => void
    selectAllSeasons: (allId: number[]) => void
    selectAllSplits: (allId: number[]) => void
    updateTournamentBySplit: (
        seasons: SeasonData[],
        isAllActive: boolean
    ) => void

    reset: () => void
}

const getTournamentId = (
    seasons: SeasonData[],
    seasonKey: string,
    splitKey: string | null,
    tournamentName: string
): number | undefined => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season) return undefined

    const splitData = season.data.find((split) =>
        splitKey ? split.split === splitKey : !split.split
    )

    if (!splitData || !splitData.tournaments) return undefined

    const tournament = splitData.tournaments.find(
        (t) => t.tournament === tournamentName
    )
    return tournament?.id
}

export const useTableEntityStore = create<TableEntityState>()(
    devtools(
        (set, get) => {
            const CACHE_TIMEOUT = 5 * 60 * 1000 // 5 minutes
            const seasonsHelpers = createCacheHelpers<CachedSeasonData>(CACHE_TIMEOUT, () => [])
            
            return {
                activeIndex: 0,
                activeTabIndex: 0,
                activeId: [],
                activeSplit: '',
                activeTournament: '',
                activeAllSeason: false,
                activeAllSplit: false,
                activeHeaderSeason: '',

                // Track user selections
                userHasSelectedTournament: false,

                // Tab configuration - empty by default, set by components
                tabConfigs: [],

                // Cache state
                seasonsCache: {},
                cacheTimeout: CACHE_TIMEOUT,

                setActiveIndex: (index) => set({ activeIndex: index }),
                setActiveTabIndex: (index) => set({ activeTabIndex: index }),
                setActiveId: (id) => set({ activeId: id }),
                setActiveSplit: (split) => set({ activeSplit: split }),
                setActiveTournament: (tournament) =>
                    set({ activeTournament: tournament }),
                setActiveAllSeason: (all) => set({ activeAllSeason: all }),
                setActiveAllSplit: (all) => set({ activeAllSplit: all }),
                setActiveHeaderSeason: (season) =>
                    set({ activeHeaderSeason: season }),

                /**
                 * Registers a single tab (called automatically by smart components)
                 * @param index - Tab index (order in the UI)
                 * @param displayName - Display name (e.g., "Aperçu", "Matchs")
                 */
                registerTab: (index, displayName) => {
                    const state = get()
                    
                    // Check if tab is already registered with same name to avoid duplicates
                    const existingTab = state.tabConfigs[index]
                    if (existingTab && existingTab.displayName === displayName) {
                        return // Already registered, skip
                    }
                    
                    // Convert display name to URL-friendly name
                    let name = displayName.toLowerCase()
                    // Remove French accents
                    name = name.replace(/[àáâãäå]/g, 'a')
                              .replace(/[èéêë]/g, 'e')
                              .replace(/[ìíîï]/g, 'i')
                              .replace(/[òóôõö]/g, 'o')
                              .replace(/[ùúûü]/g, 'u')
                              .replace(/[ÿý]/g, 'y')
                              .replace(/[ç]/g, 'c')
                    
                    const newTab = { index, name, displayName }
                    
                    // Update or add the tab at the correct index
                    const updatedConfigs = [...state.tabConfigs]
                    updatedConfigs[index] = newTab
                    
                    set({ tabConfigs: updatedConfigs })
                },

                /**
                 * Unregisters a tab (cleanup when component unmounts)
                 * @param index - Tab index to remove
                 */
                unregisterTab: (index) => {
                    const state = get()
                    const updatedConfigs = state.tabConfigs.filter(tab => tab.index !== index)
                    set({ tabConfigs: updatedConfigs })
                },

                /**
                 * Gets the tab name from index using current tab configuration
                 * @param index - Tab index
                 * @returns Tab name for URL parameter, defaults to first tab or empty string
                 */
                getTabName: (index) => {
                    const state = get()
                    const tab = state.tabConfigs[index]
                    return tab?.name || (state.tabConfigs[0]?.name || '')
                },

                /**
                 * Gets the tab index from name using current tab configuration
                 * @param name - Tab name from URL parameter
                 * @returns Tab index, defaults to 0
                 */
                getTabIndex: (name) => {
                    const state = get()
                    const tabIndex = state.tabConfigs.findIndex(tab => tab.name === name)
                    return tabIndex !== -1 ? tabIndex : 0
                },

                /**
                 * Gets the current active tab index
                 * @returns Current active tab index
                 */
                getActiveTabIndex: () => {
                    return get().activeTabIndex
                },

                /**
                 * Sets active tab
                 * @param index - Tab index to activate
                 */
                setActiveTab: (index) => {
                    set({ 
                        activeTabIndex: index,
                        activeIndex: index // Keep both for compatibility
                    })
                },

                // Cache methods for seasons
                getCachedSeasons: (leagueId) => {
                    const state = get()
                    const cached = seasonsHelpers.getCachedItem(state.seasonsCache, leagueId)
                    
                    if (!cached) {
                        return null
                    }
                    
                    // Remove expired cache automatically handled by getCachedItem
                    if (!seasonsHelpers.isCacheValid(cached.cachedAt)) {
                        set(state => ({
                            seasonsCache: seasonsHelpers.removeCacheItem(state.seasonsCache, leagueId)
                        }))
                        return null
                    }
                    
                    return cached
                },

                setCachedSeasons: (leagueId, data) => {
                    set(state => ({
                        seasonsCache: seasonsHelpers.setCachedItem(state.seasonsCache, leagueId, data)
                    }))
                },

                setSeasonsLoading: (leagueId, loading) => {
                    set(state => ({
                        seasonsCache: seasonsHelpers.setCacheLoading(state.seasonsCache, leagueId, loading)
                    }))
                },

                setSeasonsError: (leagueId, error) => {
                    set(state => ({
                        seasonsCache: seasonsHelpers.setCacheError(state.seasonsCache, leagueId, error)
                    }))
                },

                clearExpiredCache: () => {
                    const state = get()
                    
                    set({ 
                        seasonsCache: seasonsHelpers.removeExpiredItems(state.seasonsCache)
                    })
                },

                initializeWithSeasons: (seasons, isAllActive) => {
                    if (seasons.length === 0) return
                    if (!isAllActive){
                        set ({
                            activeAllSeason: false,
                            activeAllSplit:false,
                        })
                    }

                    const latestSeason = seasons[seasons.length - 1].season
                    const splits = getSplits(latestSeason, seasons)
                    const latestSplit =
                        splits.length > 0 ? splits[splits.length - 1] : ''
                    const tournaments = getTournaments(
                        latestSeason,
                        latestSplit,
                        seasons,
                        false
                    )
                    const latestTournament =
                        tournaments.length > 0
                            ? tournaments[tournaments.length - 1].tournament
                            : ''
                    const tournamentId =
                        tournaments.length > 0
                            ? [tournaments[tournaments.length - 1].id]
                            : []

                    set({
                        activeHeaderSeason: latestSeason,
                        activeSplit: latestSplit,
                        activeTournament: latestTournament,
                        activeId: tournamentId,
                        activeAllSeason: false,
                        activeAllSplit: false,
                    })
                },

                selectSeason: (season, seasons, preserveSelection = true) => {
                    const state = get()
                    const splits = getSplits(season, seasons)
                    const latestSplit =
                        splits.length > 0 ? splits[splits.length - 1] : ''
                    
                    // Try to preserve current tournament selection if it exists in the new season
                    let targetSplit = latestSplit
                    let targetTournament = ''
                    let targetTournamentId: number[] = []
                    let shouldPreserveUserSelection = state.userHasSelectedTournament
                    
                    if (preserveSelection && state.activeTournament && state.activeSplit) {
                        // Look for the same tournament in the new season
                        const foundSplit = splits.find(split => {
                            const tournaments = getTournaments(season, split, seasons, false)
                            return tournaments.some(t => t.tournament === state.activeTournament)
                        })
                        
                        if (foundSplit) {
                            // Found the same tournament in the new season
                            targetSplit = foundSplit
                            const tournaments = getTournaments(season, foundSplit, seasons, false)
                            const tournament = tournaments.find(t => t.tournament === state.activeTournament)
                            if (tournament) {
                                targetTournament = tournament.tournament
                                targetTournamentId = [tournament.id]
                            }
                        } else {
                            // Tournament not found in new season, reset user selection flag
                            shouldPreserveUserSelection = false
                        }
                    }
                    
                    // Fallback to latest tournament if preservation failed
                    if (!targetTournament) {
                        const tournaments = getTournaments(
                            season,
                            latestSplit,
                            seasons,
                            false
                        )
                        targetTournament =
                            tournaments.length > 0
                                ? tournaments[tournaments.length - 1].tournament
                                : ''
                        targetTournamentId =
                            tournaments.length > 0
                                ? [tournaments[tournaments.length - 1].id]
                                : []
                        targetSplit = latestSplit
                        shouldPreserveUserSelection = false
                    }

                    set({
                        activeHeaderSeason: season,
                        activeSplit: targetSplit,
                        activeAllSeason: false,
                        activeAllSplit: false,
                        activeTournament: targetTournament,
                        activeId: targetTournamentId,
                        userHasSelectedTournament: shouldPreserveUserSelection,
                    })
                },

                selectSplit: (split, seasons, isAllActive, preserveSelection = true) => {
                    const state = get()
                    const {
                        activeHeaderSeason,
                        activeAllSeason,
                        activeAllSplit,
                        activeTournament,
                    } = state

                    // Try to preserve current tournament if it exists in the new split
                    let targetTournament = activeTournament
                    let targetTournamentId = state.activeId
                    let shouldPreserveUserSelection = state.userHasSelectedTournament
                    
                    if (preserveSelection && activeTournament) {
                        const tournaments = getTournaments(activeHeaderSeason, split, seasons, false)
                        const foundTournament = tournaments.find(t => t.tournament === activeTournament)
                        
                        if (foundTournament) {
                            // Tournament exists in new split, preserve it
                            targetTournament = foundTournament.tournament
                            targetTournamentId = [foundTournament.id]
                        } else {
                            // Tournament doesn't exist, reset user selection flag
                            shouldPreserveUserSelection = false
                            // Fall back to latest in new split
                            const latestTournament = tournaments[tournaments.length - 1]
                            if (latestTournament) {
                                targetTournament = latestTournament.tournament
                                targetTournamentId = [latestTournament.id]
                            }
                        }
                    }

                    if (
                        (activeAllSeason || activeAllSplit) &&
                        split === state.activeSplit
                    ) {
                        const id = getTournamentId(
                            seasons,
                            activeHeaderSeason,
                            state.activeSplit,
                            activeTournament
                        )
                        if (id) {
                            set({ activeId: [id] })
                        } else {
                            const tournamentTab = getTournaments(
                                activeHeaderSeason,
                                state.activeSplit,
                                seasons,
                                isAllActive
                            )
                            const tournament =
                                tournamentTab[tournamentTab.length - 1]
                            set({
                                activeTournament: tournament.tournament,
                                activeId: tournament.allId || [tournament.id],
                            })
                        }
                    }

                    set({
                        activeSplit: split,
                        activeTournament: targetTournament,
                        activeId: targetTournamentId,
                        activeAllSplit: false,
                        activeAllSeason: false,
                        userHasSelectedTournament: shouldPreserveUserSelection,
                    })
                },

                selectTournament: (tournament) => {
                    // Mark that user has manually selected a tournament
                    // Use a single set call to prevent multiple store updates
                    if (tournament.id === -1 && tournament.allId) {
                        set({
                            activeTournament: tournament.tournament,
                            activeId: tournament.allId,
                            activeAllSeason: false,
                            activeAllSplit: false,
                            userHasSelectedTournament: true,
                        })
                    } else {
                        set({
                            activeTournament: tournament.tournament,
                            activeId: [tournament.id],
                            activeAllSeason: false,
                            activeAllSplit: false,
                            userHasSelectedTournament: true,
                        })
                    }
                },

                selectAllSeasons: (allId) => {
                    set({
                        activeAllSeason: true,
                        activeAllSplit: false,
                        activeId: allId,
                    })
                },

                selectAllSplits: (allId) => {
                    set({
                        activeAllSplit: true,
                        activeAllSeason: false,
                        activeId: allId,
                    })
                },

                updateTournamentBySplit: (seasons, isAllActive) => {
                    const { activeHeaderSeason, activeSplit, userHasSelectedTournament } = get()

                    if (!seasons || seasons.length === 0) return
                    
                    // Don't auto-update if user has manually selected a tournament
                    if (userHasSelectedTournament) {
                        return
                    }

                    const tournaments = getTournaments(
                        activeHeaderSeason,
                        activeSplit,
                        seasons,
                        isAllActive
                    )

                    if (tournaments.length > 0) {
                        const index = isAllActive ? 2 : 1
                        const selected = tournaments[tournaments.length - index]

                        if (selected) {
                            set({
                                activeTournament: selected.tournament,
                                activeId: [selected.id],
                            })
                        }
                    }
                },

                reset: () =>
                    set({
                        activeIndex: 0,
                        activeTabIndex: 0,
                        activeId: [],
                        activeSplit: '',
                        activeTournament: '',
                        activeAllSeason: false,
                        activeAllSplit: false,
                        activeHeaderSeason: '',
                        userHasSelectedTournament: false,
                    }),
            }
        },
        {
            name: 'table-entity-store',
        }
    )
)
