'use client'

import React, { useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/utils/select'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { useTableEntityStore, SeasonData, Tournament } from '@/store/tableEntityStore'

// Interfaces (simplifiées car plus besoin de context)
export interface MainProps {
    children: React.ReactNode
    className?: string
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

// Fonctions utilitaires (reprises de votre code)
export const getSeason = (seasons: SeasonData[]): string[] => {
    return seasons.map((season) => season.season)
}

export const getSplits = (seasonKey: string, seasons: SeasonData[]): string[] => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season || !season.data) return []
    return season.data
        .map((split) => split.split)
        .filter((split): split is string => typeof split === 'string')
}

export const getTournaments = (
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

export const TableEntityLayout = ({ children, className = '' }: MainProps) => {
    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {children}
        </div>
    )
}

export const TableEntityHeader = ({
    seasons,
    className = '',
    all = [],
}: HeaderProps) => {
    const {
        activeHeaderSeason,
        activeSplit,
        activeIndex,
        initializeWithSeasons,
        updateTournamentBySplit,
    } = useTableEntityStore()

    const seasonTab = getSeason(seasons)
    const splitTab = getSplits(activeHeaderSeason, seasons)
    const isAllActive = !(
        typeof activeIndex === 'number' && all.includes(activeIndex)
    )
    const tournamentTab = getTournaments(
        activeHeaderSeason,
        activeSplit,
        seasons,
        isAllActive
    )
    const allId = getAllIds(seasons)
    const splitIds = getIdsBySeason(activeHeaderSeason, seasons)

    useEffect(() => {
        if (seasons.length > 0) {
            initializeWithSeasons(seasons, isAllActive)
        }
    }, [seasons, initializeWithSeasons, isAllActive])

    useEffect(() => {
        updateTournamentBySplit(seasons, isAllActive)
    }, [activeSplit, seasons, isAllActive, updateTournamentBySplit])

    return (
        <div className={`flex flex-col w-full ${className}`}>
            <TableEntityRawSelect
                data={seasonTab}
                isAllActive={isAllActive}
                allId={allId}
                seasons={seasons}
            />
            {splitTab.length > 0 && (
                <TableEntityRawSplit
                    data={splitTab}
                    isAllActive={isAllActive}
                    allId={splitIds}
                    seasons={seasons}
                />
            )}
            {tournamentTab.length > 0 && (
                <TableEntityRawTournament data={tournamentTab} />
            )}
        </div>
    )
}


const TableEntityRawSelect = ({
    className = '',
    data,
    isAllActive,
    allId,
    seasons,
}: RawProps & { seasons: SeasonData[] }) => {
    const {
        activeHeaderSeason,
        activeAllSeason,
        selectSeason,
        selectAllSeasons,
    } = useTableEntityStore()

    const onClickAction = (value: string) => {
        selectSeason(value, seasons, isAllActive)
    }

    const onClickAll = () => {
        selectAllSeasons(allId)
    }

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px] flex flex-row justify-around items-center gap-3">
                <Select
                    value={activeHeaderSeason}
                    onValueChange={(value) => onClickAction(value)}
                >
                    <SelectTrigger
                        className={`border-none p-0 !ring-0 !focus-visible:ring-0 !focus-visible:border-none font-semibold text-sm md:text-base select-none hover:text-white data-[state=open]:text-white [&_svg]:transition-colors cursor-pointer ${
                            activeAllSeason ? 'text-grey' : 'text-white'
                        }`}
                    >
                        <SelectValue placeholder={activeHeaderSeason} />
                    </SelectTrigger>
                    <SelectContent className="bg-white-04 backdrop-blur text-clear-grey font-semibold text-sm md:text-base border-white/20">
                        {data.map((item, index) => (
                            <SelectItem
                                key={index}
                                value={item}
                                className="hover:!bg-white/20"
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
                        onClick={onClickAll}
                    >
                        All
                    </SubTitle>
                )}
            </div>
        </div>
    )
}


const TableEntityRawSplit = ({
    className = '',
    data,
    isAllActive,
    allId,
    seasons,
}: RawSplitProps) => {
    const {
        activeSplit,
        activeAllSplit,
        activeAllSeason,
        selectSplit,
        selectAllSplits,
    } = useTableEntityStore()

    const onClickAll = () => {
        selectAllSplits(allId)
    }

    const onClickSplit = (value: string) => {
        selectSplit(value, seasons, isAllActive)
    }

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px]">
                <div className="flex justify-end gap-3">
                    {data.map((item, index) => (
                        <SubTitle
                            key={index}
                            onClick={() => onClickSplit(item)}
                            className={`cursor-pointer select-none ${
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
                            onClick={onClickAll}
                        >
                            All
                        </SubTitle>
                    )}
                </div>
            </div>
        </div>
    )
}

const TableEntityRawTournament = ({
    className = '',
    data,
}: RawTournamentProps) => {
    const {
        activeTournament,
        activeAllSplit,
        activeAllSeason,
        selectTournament,
    } = useTableEntityStore()

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px]">
                <div className="flex justify-end gap-3">
                    {data.map((item, index) => (
                        <SubTitle
                            key={index}
                            onClick={() => selectTournament(item)}
                            className={`cursor-pointer select-none ${
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


export const TableEntityBody = ({ children, className = '' }: MainProps) => {
    const { activeIndex } = useTableEntityStore()

    return (
        <div className={`h-full w-full ${className}`}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    if (index === activeIndex) {
                        return child
                    } else {
                        return null
                    }
                }
                return (
                    <div>
                        ERROR IN TableEntityBody waiting for a React.validElement
                    </div>
                )
            })}
        </div>
    )
}

export const TableEntityContent = ({
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