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

// Interface du store principal
interface TableEntityState {
    activeIndex: number
    activeId: number[]
    activeSplit: string
    activeTournament: string
    activeAllSeason: boolean
    activeAllSplit: boolean
    activeHeaderSeason: string

    setActiveIndex: (index: number) => void
    setActiveId: (id: number[]) => void
    setActiveSplit: (split: string) => void
    setActiveTournament: (tournament: string) => void
    setActiveAllSeason: (all: boolean) => void
    setActiveAllSplit: (all: boolean) => void
    setActiveHeaderSeason: (season: string) => void

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

            setActiveIndex: (index) => set({ activeIndex: index }),
            setActiveId: (id) => set({ activeId: id }),
            setActiveSplit: (split) => set({ activeSplit: split }),
            setActiveTournament: (tournament) =>
                set({ activeTournament: tournament }),
            setActiveAllSeason: (all) => set({ activeAllSeason: all }),
            setActiveAllSplit: (all) => set({ activeAllSplit: all }),
            setActiveHeaderSeason: (season) =>
                set({ activeHeaderSeason: season }),

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

            selectSeason: (season, seasons, isAllActive) => {
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
