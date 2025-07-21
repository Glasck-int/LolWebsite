'use client'

import React, {
    useState,
    useContext,
    useEffect,
    isValidElement,
    ReactElement,
    ReactNode,
    act,
} from 'react'
import { createContext } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/utils/select'
import { SubTitle } from '@/components/ui/text/SubTitle'

export interface MainProps {
    children: React.ReactNode
    className?: string
}

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

interface HeaderProps {
    seasons: SeasonData[]
    className?: string
    all?: number[]
}

interface RawProps {
    className?: string
    data: string[]
    isAllActive: boolean
    allId: number[]
}

interface RawSplitProps extends RawProps {
    seasons: SeasonData[]
}

interface RawTournamentProps {
    data: Tournament[]
    className?: string
}

const LayoutContext = createContext<{
    activeIndex: number
    setActiveIndex: (index: number) => void
    activeId: number[]
    setActiveId: (id: number[]) => void
    activeSplit: string
    setActiveSplit: (split: string) => void
    activeTournament: string
    setActiveTournament: (tournament: string) => void
    activeAllSeason: boolean
    setActiveAllSeason: (all: boolean) => void
    activeAllSplit: boolean
    setActiveAllSplit: (all: boolean) => void
} | null>(null)

const HeaderContext = createContext<{
    active: string
    setActive: (active: string) => void
} | null>(null)

export const useLayout = () => {
    const context = useContext(LayoutContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

export const useHeader = () => {
    const context = useContext(HeaderContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

const getSeason = (seasons: SeasonData[]): string[] => {
    return seasons.map((season) => season.season)
}

const getSplits = (seasonKey: string, seasons: SeasonData[]): string[] => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season || !season.data) return []
    return season.data
        .map((split) => split.split)
        .filter((split): split is string => typeof split === 'string')
}

const getTournaments = (
    seasonKey: string,
    splitKey: string,
    seasons: SeasonData[],
    isAllActive: boolean
): (Tournament & { allId?: number[] })[] => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season || !season.data) return []

    let tournaments: (Tournament & { allId?: number[] })[] = []

    if (!splitKey) {
        const fallbackData = season.data.find((d) => !d.split && d.tournaments)
        if (!fallbackData) return []
        tournaments = [...(fallbackData.tournaments || [])]
    } else {
        const splitData = season.data.find((d) => d.split === splitKey)
        if (!splitData) return []
        tournaments = [...(splitData.tournaments || [])]
    }

    if (isAllActive && !tournaments.some((t) => t.tournament === 'All')) {
        const allId = tournaments.map((t) => t.id)
        tournaments.push({
            tournament: 'All',
            id: -1,
            allId,
        })
    }

    return tournaments
}

const getAllIds = (seasons: SeasonData[]): number[] => {
    return seasons.flatMap((season) =>
        season.data.flatMap(
            (split) => split.tournaments?.map((t) => t.id) || []
        )
    )
}

const getIdsBySeason = (seasonKey: string, seasons: SeasonData[]): number[] => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season) return []

    return season.data.flatMap(
        (split) => split.tournaments?.map((t) => t.id) || []
    )
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

export const TabbleEntityLayout = ({ children, className = '' }: MainProps) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [activeSplit, setActiveSplit] = useState('')
    const [activeTournament, setActiveTournament] = useState('')
    const [activeId, setActiveId] = useState<number[]>([])
    const [activeAllSeason, setActiveAllSeason] = useState(false)
    const [activeAllSplit, setActiveAllSplit] = useState(false)

    return (
        <LayoutContext.Provider
            value={{
                activeIndex,
                setActiveIndex,
                activeId,
                setActiveId,
                activeSplit,
                setActiveSplit,
                activeTournament,
                setActiveTournament,
                activeAllSeason,
                setActiveAllSeason,
                activeAllSplit,
                setActiveAllSplit,
            }}
        >
            <div className={`flex flex-col gap-4 ${className}`}>{children}</div>
        </LayoutContext.Provider>
    )
}

export const TabbleEntityHeader = ({
    seasons,
    className = '',
    all = [],
}: HeaderProps) => {
    const [active, setActive] = useState(seasons[seasons.length - 1].season)
    const {
        activeSplit,
        setActiveId,
        setActiveSplit,
        setActiveTournament,
        activeIndex,
    } = useLayout()

    const seasonTab = getSeason(seasons)
    const splitTab = getSplits(active, seasons)
    const isAllActive = !(
        typeof activeIndex === 'number' && all.includes(activeIndex)
    )
    const tournamentTab = getTournaments(
        active,
        activeSplit,
        seasons,
        isAllActive
    )
    const allId = getAllIds(seasons)
    const splitIds = getIdsBySeason(active, seasons)

    useEffect(() => {
        const splitTab = getSplits(active, seasons)
        if (splitTab.length > 0) {
            setActiveSplit(splitTab[splitTab.length - 1])
        }
    }, [active])

    useEffect(() => {
        const tournamentTab = getTournaments(
            active,
            activeSplit,
            seasons,
            isAllActive
        )
        if (tournamentTab.length > 0) {
            const index = isAllActive ? 2 : 1
            setActiveTournament(
                tournamentTab[tournamentTab.length - index].tournament
            )
            setActiveId([tournamentTab[tournamentTab.length - index].id])
        }
    }, [activeSplit, active])

    return (
        <HeaderContext.Provider value={{ active, setActive }}>
            <div className={`flex flex-col w-full ${className}`}>
                <TabbleEntityRawSelect
                    data={seasonTab}
                    isAllActive={isAllActive}
                    allId={allId}
                />
                {splitTab.length > 0 && (
                    <TabbleEntityRawSplit
                        data={splitTab}
                        isAllActive={isAllActive}
                        allId={splitIds}
                        seasons={seasons}
                    />
                )}
                {tournamentTab.length > 0 && (
                    <TabbleEntityRawTournament data={tournamentTab} />
                )}
            </div>
        </HeaderContext.Provider>
    )
}

const TabbleEntityRawSelect = ({
    className = '',
    data,
    isAllActive,
    allId,
}: RawProps) => {
    const {
        setActiveSplit,
        activeAllSeason,
        setActiveAllSeason,
        setActiveId,
        setActiveAllSplit,
    } = useLayout()
    const { active, setActive } = useHeader()

    const onClickAction = (value: string) => {
        setActive(value)
        setActiveSplit('')
        setActiveAllSeason(false)
        setActiveAllSplit(false)
    }

    const onClickAll = (value: boolean) => {
        setActiveAllSeason(value)
        setActiveAllSplit(!value)
        setActiveId(allId)
    }

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px] flex flex-row justify-around items-center gap-3">
                <Select
                    defaultValue={active}
                    onValueChange={(value) => onClickAction(value)}
                >
                    <SelectTrigger
                        className={`border-none p-0 !ring-0 !focus-visible:ring-0 !focus-visible:border-none font-semibold text-sm md:text-base select-none hover:text-white data-[state=open]:text-white [&_svg]:transition-colors cursor-pointer ${
                            activeAllSeason ? 'text-clear-grey' : 'text-white'
                        }`}
                    >
                        <SelectValue placeholder={active} />
                    </SelectTrigger>
                    <SelectContent className="bg-white-04 backdrop-blur text-clear-grey font-semibold text-sm md:text-base border-white/20">
                        {data.map((item, index) => (
                            <SelectItem
                                key={index}
                                value={item}
                                className="hover:!bg-white/20 "
                            >
                                {item}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isAllActive && (
                    <SubTitle
                        className={`hover:text-white cursor-pointer select-none ${
                            activeAllSeason ? 'text-white' : 'text-grey'
                        }`}
                        onClick={() => onClickAll(true)}
                    >
                        All
                    </SubTitle>
                )}
            </div>
        </div>
    )
}

const TabbleEntityRawSplit = ({
    className = '',
    data,
    isAllActive,
    allId,
    seasons,
}: RawSplitProps) => {
    const {
        activeSplit,
        setActiveSplit,
        activeAllSplit,
        activeAllSeason,
        setActiveAllSplit,
        setActiveId,
        setActiveAllSeason,
        activeTournament,
        setActiveTournament,
    } = useLayout()
    const { active } = useHeader()

    const onClickAll = (value: boolean) => {
        setActiveAllSplit(value)
        setActiveAllSeason(!value)
        setActiveId(allId)
    }

    const onClickSplit = (value: string) => {
        if ((activeAllSeason || activeAllSplit) && value === activeSplit) {
            var id = getTournamentId(
                seasons,
                active,
                activeSplit,
                activeTournament
            )
            if (id) {
                setActiveId([id])
            } else {
                const tournamentTab = getTournaments(
                    active,
                    activeSplit,
                    seasons,
                    isAllActive
                )
                const tournament = tournamentTab[tournamentTab.length - 1]
                setActiveTournament(tournament.tournament)
                if (tournament.allId) setActiveId(tournament.allId)
            }
        }
        setActiveSplit(value)
        setActiveAllSplit(false)
        setActiveAllSeason(false)
    }

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px]">
                <div className="flex justify-end gap-3">
                    {data.map((item, index) => (
                        <SubTitle
                            key={index}
                            onClick={() => onClickSplit(item)}
                            className={` cursor-pointer select-none ${
                                activeSplit === item &&
                                !activeAllSplit &&
                                !activeAllSeason
                                    ? 'text-white'
                                    : 'text-grey hover:text-clear-grey'
                            }`}
                        >
                            {item}
                        </SubTitle>
                    ))}
                    {isAllActive && (
                        <SubTitle
                            className={`hover:text-white cursor-pointer select-none ${
                                activeAllSplit ? 'text-white' : 'text-grey'
                            }`}
                            onClick={() => onClickAll(true)}
                        >
                            All
                        </SubTitle>
                    )}
                </div>
            </div>
        </div>
    )
}

const TabbleEntityRawTournament = ({
    className = '',
    data,
}: RawTournamentProps) => {
    const {
        activeTournament,
        setActiveTournament,
        setActiveId,
        setActiveAllSeason,
        setActiveAllSplit,
        activeAllSplit,
        activeAllSeason,
    } = useLayout()

    const setActive = (item: Tournament) => {
        setActiveTournament(item.tournament)
        if (item.id == -1 && item.allId) {
            setActiveId(item.allId)
            setActiveAllSeason(false)
            setActiveAllSplit(false)
        } else setActiveId([item.id])
    }

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px]">
                <div className="flex justify-end gap-3">
                    {data.map((item, index) => (
                        <SubTitle
                            key={index}
                            onClick={() => setActive(item)}
                            className={` cursor-pointer select-none ${
                                activeTournament === item.tournament &&
                                !activeAllSeason &&
                                !activeAllSplit
                                    ? 'text-white'
                                    : 'text-grey hover:text-clear-grey'
                            }`}
                        >
                            {item.tournament}
                        </SubTitle>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const TabbleEntityBody = ({ children, className = '' }: MainProps) => {
    const { activeIndex } = useLayout()

    return (
        <div className={`h-full w-full ${className}`}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    if (index == activeIndex) {
                        return child
                    } else {
                        return null
                    }
                }
                return (
                    <div>
                        ERROR IN TableEntityBody waiting for an
                        React.valideElement
                    </div>
                )
            })}
        </div>
    )
}

export const TabbleEntityContent = ({
    children,
    className = '',
}: MainProps) => {
    return (
        <div className="w-full h-full">
            <div className={`flex flex-col gap-4 h-full w-full ${className}`}>
                {children}
            </div>
        </div>
    )
}
