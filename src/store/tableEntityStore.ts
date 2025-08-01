// store/tableEntityStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
    getSplits,
    getTournaments,
} from '@/components/layout/TableEntityLayout/TableEntityLayout'
import { createCacheHelpers, CacheItem } from '@/lib/cacheUtils'
import { MatchSchedule, Standings } from '@/generated/prisma'
import { ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'

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

interface CachedMatchData {
    matches: MatchSchedule[]
    teamsData: Array<{
        short?: string | null
        image?: string | null
        overviewPage?: string | null
    }>
    teamImages: Array<{
        team1Image?: string | null
        team2Image?: string | null
    }>
    lastMatches: boolean
}

interface CachedStandingsOverviewData {
    standings: Standings[]
    processedData: ProcessedStanding[]
    tournamentName: string
}

interface CachedStandingsWithTabsData {
    standings: Standings[]
    processedData: ProcessedStanding[]
    tournamentName: string
}

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

    // Tab configuration set by components
    tabConfigs: TabConfig[]

    // Cache des saisons par leagueId
    seasonsCache: Record<number, CacheItem<CachedSeasonData>>
    // Cache des matches par tournamentId
    matchesCache: Record<number, CacheItem<CachedMatchData>>
    // Cache des standings overview par tournamentId
    standingsOverviewCache: Record<number, CacheItem<CachedStandingsOverviewData>>
    // Cache des standings with tabs par tournamentId
    standingsWithTabsCache: Record<number, CacheItem<CachedStandingsWithTabsData>>
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
     * Tab management methods - Auto-detection and URL synchronization  
     */
    registerTab: (index: number, displayName: string) => void
    unregisterTab: (index: number) => void
    getTabName: (index: number) => string
    getTabIndex: (name: string) => number
    setActiveTab: (index: number) => void
    getActiveTabIndex: () => number
    initializeFromUrl: (searchParams: URLSearchParams, seasons?: SeasonData[]) => void

    // Cache methods for seasons
    getCachedSeasons: (leagueId: number) => CacheItem<CachedSeasonData> | null
    setCachedSeasons: (leagueId: number, data: CachedSeasonData) => void
    setSeasonsLoading: (leagueId: number, loading: boolean) => void
    setSeasonsError: (leagueId: number, error: string | null) => void
    
    // Cache methods for matches
    getCachedMatches: (tournamentId: number) => CacheItem<CachedMatchData> | null
    setCachedMatches: (tournamentId: number, data: CachedMatchData) => void
    setMatchesLoading: (tournamentId: number, loading: boolean) => void
    setMatchesError: (tournamentId: number, error: string | null) => void
    
    // Cache methods for standings overview
    getCachedStandingsOverview: (tournamentId: number) => CacheItem<CachedStandingsOverviewData> | null
    setCachedStandingsOverview: (tournamentId: number, data: CachedStandingsOverviewData) => void
    setStandingsOverviewLoading: (tournamentId: number, loading: boolean) => void
    setStandingsOverviewError: (tournamentId: number, error: string | null) => void
    
    // Cache methods for standings with tabs
    getCachedStandingsWithTabs: (tournamentId: number) => CacheItem<CachedStandingsWithTabsData> | null
    setCachedStandingsWithTabs: (tournamentId: number, data: CachedStandingsWithTabsData) => void
    setStandingsWithTabsLoading: (tournamentId: number, loading: boolean) => void
    setStandingsWithTabsError: (tournamentId: number, error: string | null) => void
    
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

    /**
     * URL synchronization methods - Synchronizes store state with URL parameters
     * for shareable links that preserve season/split/tournament selection
     */
    _updateUrl: () => void
    syncFromUrl: (params: URLSearchParams, seasons: SeasonData[]) => void
    syncToUrl: () => URLSearchParams
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
            const matchesHelpers = createCacheHelpers<CachedMatchData>(CACHE_TIMEOUT, () => ({
                matches: [],
                teamsData: [],
                teamImages: [],
                lastMatches: false
            }))
            const standingsOverviewHelpers = createCacheHelpers<CachedStandingsOverviewData>(CACHE_TIMEOUT, () => ({
                standings: [],
                processedData: [],
                tournamentName: ''
            }))
            const standingsWithTabsHelpers = createCacheHelpers<CachedStandingsWithTabsData>(CACHE_TIMEOUT, () => ({
                standings: [],
                processedData: [],
                tournamentName: ''
            }))
            
            return {
                activeIndex: 0,
                activeTabIndex: 0,
                activeId: [],
                activeSplit: '',
                activeTournament: '',
                activeAllSeason: false,
                activeAllSplit: false,
                activeHeaderSeason: '',

                // Tab configuration - empty by default, set by components
                tabConfigs: [],

                // Cache state
                seasonsCache: {},
                matchesCache: {},
                standingsOverviewCache: {},
                standingsWithTabsCache: {},
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
                 * Initializes tabs from URL parameters (called once when all tabs are registered)
                 * @param searchParams - URL search parameters
                 * @param seasons - Optional seasons data for full sync
                 */
                initializeFromUrl: (searchParams, seasons) => {
                    // Sync tab from URL
                    const tabParam = searchParams.get('tab')
                    if (tabParam) {
                        const tabIndex = get().getTabIndex(tabParam)
                        set({ 
                            activeTabIndex: tabIndex,
                            activeIndex: tabIndex 
                        })
                    }
                    
                    // Sync other parameters if seasons provided
                    if (seasons && seasons.length > 0) {
                        get().syncFromUrl(searchParams, seasons)
                    }
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
                 * Sets active tab and updates URL automatically
                 * @param index - Tab index to activate
                 */
                setActiveTab: (index) => {
                    set({ 
                        activeTabIndex: index,
                        activeIndex: index // Keep both for compatibility
                    })
                    
                    // Update URL with new tab
                    get()._updateUrl()
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

                // Cache methods for matches
                getCachedMatches: (tournamentId) => {
                    const state = get()
                    const cached = matchesHelpers.getCachedItem(state.matchesCache, tournamentId)
                    
                    if (!cached) {
                        return null
                    }
                    
                    // Remove expired cache automatically handled by getCachedItem
                    if (!matchesHelpers.isCacheValid(cached.cachedAt)) {
                        set(state => ({
                            matchesCache: matchesHelpers.removeCacheItem(state.matchesCache, tournamentId)
                        }))
                        return null
                    }
                    
                    return cached
                },

                setCachedMatches: (tournamentId, data) => {
                    set(state => ({
                        matchesCache: matchesHelpers.setCachedItem(state.matchesCache, tournamentId, data)
                    }))
                },

                setMatchesLoading: (tournamentId, loading) => {
                    set(state => ({
                        matchesCache: matchesHelpers.setCacheLoading(state.matchesCache, tournamentId, loading)
                    }))
                },

                setMatchesError: (tournamentId, error) => {
                    set(state => ({
                        matchesCache: matchesHelpers.setCacheError(state.matchesCache, tournamentId, error)
                    }))
                },

                // Cache methods for standings overview
                getCachedStandingsOverview: (tournamentId) => {
                    const state = get()
                    const cached = standingsOverviewHelpers.getCachedItem(state.standingsOverviewCache, tournamentId)
                    
                    if (!cached) {
                        return null
                    }
                    
                    // Remove expired cache automatically handled by getCachedItem
                    if (!standingsOverviewHelpers.isCacheValid(cached.cachedAt)) {
                        set(state => ({
                            standingsOverviewCache: standingsOverviewHelpers.removeCacheItem(state.standingsOverviewCache, tournamentId)
                        }))
                        return null
                    }
                    
                    return cached
                },

                setCachedStandingsOverview: (tournamentId, data) => {
                    set(state => ({
                        standingsOverviewCache: standingsOverviewHelpers.setCachedItem(state.standingsOverviewCache, tournamentId, data)
                    }))
                },

                setStandingsOverviewLoading: (tournamentId, loading) => {
                    set(state => ({
                        standingsOverviewCache: standingsOverviewHelpers.setCacheLoading(state.standingsOverviewCache, tournamentId, loading)
                    }))
                },

                setStandingsOverviewError: (tournamentId, error) => {
                    set(state => ({
                        standingsOverviewCache: standingsOverviewHelpers.setCacheError(state.standingsOverviewCache, tournamentId, error)
                    }))
                },

                // Cache methods for standings with tabs
                getCachedStandingsWithTabs: (tournamentId) => {
                    const state = get()
                    const cached = standingsWithTabsHelpers.getCachedItem(state.standingsWithTabsCache, tournamentId)
                    
                    if (!cached) {
                        return null
                    }
                    
                    // Remove expired cache automatically handled by getCachedItem
                    if (!standingsWithTabsHelpers.isCacheValid(cached.cachedAt)) {
                        set(state => ({
                            standingsWithTabsCache: standingsWithTabsHelpers.removeCacheItem(state.standingsWithTabsCache, tournamentId)
                        }))
                        return null
                    }
                    
                    return cached
                },

                setCachedStandingsWithTabs: (tournamentId, data) => {
                    set(state => ({
                        standingsWithTabsCache: standingsWithTabsHelpers.setCachedItem(state.standingsWithTabsCache, tournamentId, data)
                    }))
                },

                setStandingsWithTabsLoading: (tournamentId, loading) => {
                    set(state => ({
                        standingsWithTabsCache: standingsWithTabsHelpers.setCacheLoading(state.standingsWithTabsCache, tournamentId, loading)
                    }))
                },

                setStandingsWithTabsError: (tournamentId, error) => {
                    set(state => ({
                        standingsWithTabsCache: standingsWithTabsHelpers.setCacheError(state.standingsWithTabsCache, tournamentId, error)
                    }))
                },

                clearExpiredCache: () => {
                    const state = get()
                    
                    set({ 
                        seasonsCache: seasonsHelpers.removeExpiredItems(state.seasonsCache),
                        matchesCache: matchesHelpers.removeExpiredItems(state.matchesCache),
                        standingsOverviewCache: standingsOverviewHelpers.removeExpiredItems(state.standingsOverviewCache),
                        standingsWithTabsCache: standingsWithTabsHelpers.removeExpiredItems(state.standingsWithTabsCache)
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

                selectSeason: (season, seasons) => {
                    const splits = getSplits(season, seasons)
                    const latestSplit =
                        splits.length > 0 ? splits[splits.length - 1] : ''
                    const tournaments = getTournaments(
                        season,
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
                        activeHeaderSeason: season,
                        activeSplit: latestSplit,
                        activeAllSeason: false,
                        activeAllSplit: false,
                        activeTournament: latestTournament,
                        activeId: tournamentId,
                    })
                    
                    // Sync URL with new state
                    get()._updateUrl()
                },

                selectSplit: (split, seasons, isAllActive) => {
                    const state = get()
                    const {
                        activeHeaderSeason,
                        activeAllSeason,
                        activeAllSplit,
                        activeTournament,
                    } = state

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
                        activeAllSplit: false,
                        activeAllSeason: false,
                    })
                    
                    // Sync URL with new state
                    get()._updateUrl()
                },

                selectTournament: (tournament) => {
                    if (tournament.id === -1 && tournament.allId) {
                        set({
                            activeTournament: tournament.tournament,
                            activeId: tournament.allId,
                        })
                    } else {
                        set({
                            activeTournament: tournament.tournament,
                            activeId: [tournament.id],
                        })
                    }
                    set({
                        activeAllSeason: false,
                        activeAllSplit: false,
                    })
                    
                    // Sync URL with new state
                    get()._updateUrl()
                },

                selectAllSeasons: (allId) => {
                    set({
                        activeAllSeason: true,
                        activeAllSplit: false,
                        activeId: allId,
                    })
                    
                    // Sync URL with new state
                    get()._updateUrl()
                },

                selectAllSplits: (allId) => {
                    set({
                        activeAllSplit: true,
                        activeAllSeason: false,
                        activeId: allId,
                    })
                    
                    // Sync URL with new state
                    get()._updateUrl()
                },

                updateTournamentBySplit: (seasons, isAllActive) => {
                    const { activeHeaderSeason, activeSplit } = get()

                    if (!seasons || seasons.length === 0) return

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
                    }),

                /**
                 * Updates the browser URL with current store state (internal helper)
                 * @private
                 */
                _updateUrl: () => {
                    if (typeof window !== 'undefined') {
                        try {
                            const state = get()
                            const params = state.syncToUrl()
                            
                            // Add current tab to URL
                            params.set('tab', state.getTabName(state.activeTabIndex))
                            
                            const newUrl = `${window.location.pathname}?${params.toString()}`
                            window.history.replaceState({}, '', newUrl)
                        } catch (error) {
                            console.warn('Failed to sync URL:', error)
                        }
                    }
                },

                /**
                 * Synchronizes store state from URL parameters for shareable links
                 * @param params - URLSearchParams from the current URL
                 * @param seasons - Available season data to validate against
                 * 
                 * URL format: ?season=2024&split=Summer&tournament=Playoffs&tab=matchs
                 * - season: The season to select (e.g., "2024")
                 * - split: The split within the season (e.g., "Summer")  
                 * - tournament: The tournament name (e.g., "Playoffs")
                 * - tab: The active tab name (e.g., "matchs", "apercu")
                 * 
                 * Special values:
                 * - season=all: Selects all seasons
                 * - split=all: Selects all splits within the season
                 * - tournament=all: Selects all tournaments within the split
                 */
                syncFromUrl: (params, seasons) => {
                    if (seasons.length === 0) return

                    const seasonParam = params.get('season')
                    const splitParam = params.get('split')
                    const tournamentParam = params.get('tournament')
                    const tabParam = params.get('tab')

                    // Sync tab first (independent of other parameters)
                    if (tabParam) {
                        const tabIndex = get().getTabIndex(tabParam)
                        set({ 
                            activeTabIndex: tabIndex,
                            activeIndex: tabIndex // Keep both for compatibility
                        })
                    }

                    // Handle "all seasons" case
                    if (seasonParam === 'all') {
                        const allId = seasons.flatMap(season =>
                            season.data.flatMap(split =>
                                split.tournaments?.map(t => t.id) || []
                            )
                        )
                        set({
                            activeAllSeason: true,
                            activeAllSplit: false,
                            activeId: allId,
                            activeHeaderSeason: seasons[seasons.length - 1].season
                        })
                        return
                    }

                    // Find and validate season
                    const season = seasons.find(s => s.season === seasonParam)
                    if (!season && seasonParam) return // Invalid season param

                    const targetSeason = season?.season || seasons[seasons.length - 1].season
                    const splits = getSplits(targetSeason, seasons)

                    // Handle "all splits" case
                    if (splitParam === 'all' && season) {
                        const allId = season.data.flatMap(split =>
                            split.tournaments?.map(t => t.id) || []
                        )
                        set({
                            activeHeaderSeason: targetSeason,
                            activeAllSeason: false,
                            activeAllSplit: true,
                            activeId: allId,
                            activeSplit: splits.length > 0 ? splits[splits.length - 1] : ''
                        })
                        return
                    }

                    // Find and validate split
                    const targetSplit = splitParam && splits.includes(splitParam) 
                        ? splitParam 
                        : (splits.length > 0 ? splits[splits.length - 1] : '')

                    const tournaments = getTournaments(targetSeason, targetSplit, seasons, false)

                    // Handle "all tournaments" case
                    if (tournamentParam === 'all' && tournaments.length > 0) {
                        const allId = tournaments.map(t => t.id)
                        set({
                            activeHeaderSeason: targetSeason,
                            activeSplit: targetSplit,
                            activeAllSeason: false,
                            activeAllSplit: false,
                            activeTournament: 'All',
                            activeId: allId
                        })
                        return
                    }

                    // Find and validate tournament
                    const tournament = tournaments.find(t => t.tournament === tournamentParam)
                    const targetTournament = tournament || tournaments[tournaments.length - 1]

                    if (targetTournament) {
                        set({
                            activeHeaderSeason: targetSeason,
                            activeSplit: targetSplit,
                            activeTournament: targetTournament.tournament,
                            activeId: [targetTournament.id],
                            activeAllSeason: false,
                            activeAllSplit: false
                        })
                    }
                },

                /**
                 * Generates URL parameters from current store state for shareable links
                 * @returns URLSearchParams object with current selection encoded
                 * 
                 * Generates clean URLs like:
                 * - ?season=2024&split=Summer&tournament=Playoffs&tab=matchs
                 * - ?season=all&tab=apercu (for all seasons)
                 * - ?season=2024&split=all&tab=statistiques (for all splits in season)
                 */
                syncToUrl: () => {
                    const state = get()
                    const params = new URLSearchParams()

                    // Handle special "all" cases
                    if (state.activeAllSeason) {
                        params.set('season', 'all')
                    } else if (state.activeAllSplit) {
                        params.set('season', state.activeHeaderSeason)
                        params.set('split', 'all')
                    } else {
                        // Normal selection
                        if (state.activeHeaderSeason) {
                            params.set('season', state.activeHeaderSeason)
                        }
                        if (state.activeSplit) {
                            params.set('split', state.activeSplit)
                        }
                        if (state.activeTournament) {
                            if (state.activeTournament === 'All') {
                                params.set('tournament', 'all')
                            } else {
                                params.set('tournament', state.activeTournament)
                            }
                        }
                    }

                    return params
                },
            }
        },
        {
            name: 'table-entity-store',
        }
    )
)
