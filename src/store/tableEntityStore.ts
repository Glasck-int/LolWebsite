// store/tableEntityStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
    getSplits,
    getTournaments,
} from '@/components/layout/TableEntityLayout/TableEntityLayout'

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

// Interface pour le cache des saisons
interface CachedSeasonData {
    data: SeasonData[]
    cachedAt: number
    loading: boolean
    error: string | null
}

// Interface pour le cache des matches
interface CachedMatchData {
    matches: any[]
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
    cachedAt: number
    loading: boolean
    error: string | null
}

// Interface du store principal
interface TableEntityState {
    activeIndex: number
    activeId: number[]
    activeSplit: string
    activeTournament: string
    activeAllSeason: boolean
    activeAllSplit: boolean
    activeHeaderSeason: string

    // Cache des saisons par leagueId
    seasonsCache: Record<number, CachedSeasonData>
    // Cache des matches par tournamentId
    matchesCache: Record<number, CachedMatchData>
    cacheTimeout: number // 5 minutes par défaut

    setActiveIndex: (index: number) => void
    setActiveId: (id: number[]) => void
    setActiveSplit: (split: string) => void
    setActiveTournament: (tournament: string) => void
    setActiveAllSeason: (all: boolean) => void
    setActiveAllSplit: (all: boolean) => void
    setActiveHeaderSeason: (season: string) => void

    // Méthodes pour le cache des saisons
    getCachedSeasons: (leagueId: number) => CachedSeasonData | null
    setCachedSeasons: (leagueId: number, data: SeasonData[]) => void
    setCacheLoading: (leagueId: number, loading: boolean) => void
    setCacheError: (leagueId: number, error: string | null) => void
    
    // Méthodes pour le cache des matches
    getCachedMatches: (tournamentId: number) => CachedMatchData | null
    setCachedMatches: (tournamentId: number, data: Omit<CachedMatchData, 'cachedAt' | 'loading' | 'error'>) => void
    setMatchesLoading: (tournamentId: number, loading: boolean) => void
    setMatchesError: (tournamentId: number, error: string | null) => void
    
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
        (set, get) => ({
            activeIndex: 0,
            activeId: [],
            activeSplit: '',
            activeTournament: '',
            activeAllSeason: false,
            activeAllSplit: false,
            activeHeaderSeason: '',

            // État du cache
            seasonsCache: {},
            matchesCache: {},
            cacheTimeout: 5 * 60 * 1000, // 5 minutes

            setActiveIndex: (index) => set({ activeIndex: index }),
            setActiveId: (id) => set({ activeId: id }),
            setActiveSplit: (split) => set({ activeSplit: split }),
            setActiveTournament: (tournament) =>
                set({ activeTournament: tournament }),
            setActiveAllSeason: (all) => set({ activeAllSeason: all }),
            setActiveAllSplit: (all) => set({ activeAllSplit: all }),
            setActiveHeaderSeason: (season) =>
                set({ activeHeaderSeason: season }),

            // Méthodes du cache
            getCachedSeasons: (leagueId) => {
                const state = get()
                const cached = state.seasonsCache[leagueId]
                
                if (!cached) return null
                
                // Vérifier si le cache est expiré
                const isExpired = Date.now() - cached.cachedAt > state.cacheTimeout
                if (isExpired) {
                    // Supprimer le cache expiré
                    set(state => {
                        const { [leagueId]: _, ...rest } = state.seasonsCache
                        return { seasonsCache: rest }
                    })
                    return null
                }
                
                return cached
            },

            setCachedSeasons: (leagueId, data) => {
                set(state => ({
                    seasonsCache: {
                        ...state.seasonsCache,
                        [leagueId]: {
                            data,
                            cachedAt: Date.now(),
                            loading: false,
                            error: null
                        }
                    }
                }))
            },

            setCacheLoading: (leagueId, loading) => {
                set(state => ({
                    seasonsCache: {
                        ...state.seasonsCache,
                        [leagueId]: {
                            ...state.seasonsCache[leagueId],
                            data: state.seasonsCache[leagueId]?.data || [],
                            cachedAt: state.seasonsCache[leagueId]?.cachedAt || Date.now(),
                            loading,
                            error: state.seasonsCache[leagueId]?.error || null
                        }
                    }
                }))
            },

            setCacheError: (leagueId, error) => {
                set(state => ({
                    seasonsCache: {
                        ...state.seasonsCache,
                        [leagueId]: {
                            ...state.seasonsCache[leagueId],
                            data: state.seasonsCache[leagueId]?.data || [],
                            cachedAt: state.seasonsCache[leagueId]?.cachedAt || Date.now(),
                            loading: false,
                            error
                        }
                    }
                }))
            },

            // Méthodes du cache des matches
            getCachedMatches: (tournamentId) => {
                const state = get()
                const cached = state.matchesCache[tournamentId]
                
                if (!cached) return null
                
                // Vérifier si le cache est expiré
                const isExpired = Date.now() - cached.cachedAt > state.cacheTimeout
                if (isExpired) {
                    // Supprimer le cache expiré
                    set(state => {
                        const { [tournamentId]: _, ...rest } = state.matchesCache
                        return { matchesCache: rest }
                    })
                    return null
                }
                
                return cached
            },

            setCachedMatches: (tournamentId, data) => {
                set(state => ({
                    matchesCache: {
                        ...state.matchesCache,
                        [tournamentId]: {
                            ...data,
                            cachedAt: Date.now(),
                            loading: false,
                            error: null
                        }
                    }
                }))
            },

            setMatchesLoading: (tournamentId, loading) => {
                set(state => ({
                    matchesCache: {
                        ...state.matchesCache,
                        [tournamentId]: {
                            ...state.matchesCache[tournamentId],
                            matches: state.matchesCache[tournamentId]?.matches || [],
                            teamsData: state.matchesCache[tournamentId]?.teamsData || [],
                            teamImages: state.matchesCache[tournamentId]?.teamImages || [],
                            lastMatches: state.matchesCache[tournamentId]?.lastMatches || false,
                            cachedAt: state.matchesCache[tournamentId]?.cachedAt || Date.now(),
                            loading,
                            error: state.matchesCache[tournamentId]?.error || null
                        }
                    }
                }))
            },

            setMatchesError: (tournamentId, error) => {
                set(state => ({
                    matchesCache: {
                        ...state.matchesCache,
                        [tournamentId]: {
                            ...state.matchesCache[tournamentId],
                            matches: state.matchesCache[tournamentId]?.matches || [],
                            teamsData: state.matchesCache[tournamentId]?.teamsData || [],
                            teamImages: state.matchesCache[tournamentId]?.teamImages || [],
                            lastMatches: state.matchesCache[tournamentId]?.lastMatches || false,
                            cachedAt: state.matchesCache[tournamentId]?.cachedAt || Date.now(),
                            loading: false,
                            error
                        }
                    }
                }))
            },

            clearExpiredCache: () => {
                const state = get()
                const now = Date.now()
                
                // Nettoyer les saisons expirées
                const filteredSeasons = Object.entries(state.seasonsCache).reduce((acc, [key, value]) => {
                    if (value && now - value.cachedAt < state.cacheTimeout) {
                        acc[parseInt(key)] = value
                    }
                    return acc
                }, {} as Record<number, CachedSeasonData>)
                
                // Nettoyer les matches expirés
                const filteredMatches = Object.entries(state.matchesCache).reduce((acc, [key, value]) => {
                    if (value && now - value.cachedAt < state.cacheTimeout) {
                        acc[parseInt(key)] = value
                    }
                    return acc
                }, {} as Record<number, CachedMatchData>)
                
                set({ 
                    seasonsCache: filteredSeasons,
                    matchesCache: filteredMatches
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
                    activeId: [],
                    activeSplit: '',
                    activeTournament: '',
                    activeAllSeason: false,
                    activeAllSplit: false,
                    activeHeaderSeason: '',
                }),
        }),
        {
            name: 'table-entity-store',
        }
    )
)
