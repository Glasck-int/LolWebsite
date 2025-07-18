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
}

interface RawProps {
    className?: string
    data: string[]
}

interface RawTournamentProps {
    data: Tournament[]
    className?: string
}

const LayoutContext = createContext<{
    activeAll: boolean
    setActiveAll : (all: boolean) => void
    activeIndex: number
    setActiveIndex: (index: number) => void
    activeId: number[]
    setActiveId: (id: number[]) => void
    activeSplit: string
    setActiveSplit: (split: string) => void
    activeTournament: string
    setActiveTournament: (tournament: string) => void
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
    seasons: SeasonData[]
): Tournament[] => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season || !season.data) return []

    if (!splitKey) {
        const fallbackData = season.data.find((d) => !d.split && d.tournaments)
        return fallbackData?.tournaments || []
    }

    const splitData = season.data.find((d) => d.split === splitKey)
    if (!splitData) return []

    return splitData.tournaments || []
}

export const TabbleEntityLayout = ({ children, className = '' }: MainProps) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [activeSplit, setActiveSplit] = useState('')
    const [activeTournament, setActiveTournament] = useState('')
    const [activeId, setActiveId] = useState<number[]>([])
    const [activeAll, setActiveAll] = useState(true)

    return (
        <LayoutContext.Provider
            value={{
                activeAll,
                setActiveAll,
                activeIndex,
                setActiveIndex,
                activeId,
                setActiveId,
                activeSplit,
                setActiveSplit,
                activeTournament,
                setActiveTournament,
            }}
        >
            <div className={`flex flex-col gap-4 ${className}`}>{children}</div>
        </LayoutContext.Provider>
    )
}

export const TabbleEntityHeader = ({
    seasons,
    className = '',
}: HeaderProps) => {
    const [active, setActive] = useState(seasons[seasons.length - 1].season)
    const {
        activeSplit,
        setActiveId,
        activeTournament,
        setActiveSplit,
        setActiveTournament,
    } = useLayout()

    const seasonTab = getSeason(seasons)
    const splitTab = getSplits(active, seasons)
    const tournamentTab = getTournaments(active, activeSplit, seasons)

    useEffect(() => {
        const splitTab = getSplits(active, seasons)
        if (splitTab.length > 0) {
            setActiveSplit(splitTab[splitTab.length - 1])
        }
    }, [active])

    useEffect(() => {
        const tournamentTab = getTournaments(active, activeSplit, seasons)
        if (tournamentTab.length > 0) {
            setActiveTournament(
                tournamentTab[tournamentTab.length - 1].tournament
            )
            setActiveId([tournamentTab[tournamentTab.length - 1].id])
        }
    }, [activeSplit, active])

    return (
        <HeaderContext.Provider value={{ active, setActive }}>
            <div className={`flex flex-col w-full ${className}`}>
                <TabbleEntityRawSelect data={seasonTab} />
                {splitTab.length > 0 && (
                    <TabbleEntityRawSplit data={splitTab} />
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
}: RawProps) => {
    const {setActiveSplit} = useLayout()
    const { active, setActive } = useHeader()

    const onClickAction = (value:string) => {
        setActive(value)
        setActiveSplit("")
    }

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px]">
                <Select
                    defaultValue={active}
                    onValueChange={(value) => onClickAction(value)}
                >
                    <SelectTrigger className="border-none p-0 !ring-0 !focus-visible:ring-0 !focus-visible:border-none text-clear-grey font-semibold text-sm md:text-base select-none hover:text-white data-[state=open]:text-white [&_svg]:transition-colors cursor-pointer">
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
            </div>
        </div>
    )
}

const TabbleEntityRawSplit = ({
    className = '',
    data,
}: RawProps) => {
    const { activeSplit, setActiveSplit } = useLayout()

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px]">
                <div className="flex justify-end gap-3">
                    {data.map((item, index) => (
                        <SubTitle
                            key={index}
                            onClick={() => setActiveSplit(item)}
                            className={` cursor-pointer select-none ${
                                activeSplit === item
                                    ? 'text-white'
                                    : 'text-grey hover:text-clear-grey'
                            }`}
                        >
                            {item}
                        </SubTitle>
                    ))}
                </div>
            </div>
        </div>
    )
}

const TabbleEntityRawTournament = ({
    className = '',
    data,
}: RawTournamentProps) => {
    const { activeTournament, setActiveTournament, setActiveId } = useLayout()

    const setActive = (item: Tournament) => {
        setActiveTournament(item.tournament)
        setActiveId([item.id])
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
                                activeTournament === item.tournament
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
