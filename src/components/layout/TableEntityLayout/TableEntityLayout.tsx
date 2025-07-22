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

// interface

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

// Context

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

// Function

/**
 * Custom React hook to access and manage layout-related state via LayoutContext.
 *
 * @function useLayout
 * @throws {Error} Throws an error if the hook is used outside of a LayoutContext provider.
 * @returns {{
 *   activeIndex: number,
 *   setActiveIndex: (index: number) => void,
 *   activeId: number[],
 *   setActiveId: (id: number[]) => void,
 *   activeSplit: string,
 *   setActiveSplit: (split: string) => void,
 *   activeTournament: string,
 *   setActiveTournament: (tournament: string) => void,
 *   activeAllSeason: boolean,
 *   setActiveAllSeason: (all: boolean) => void,
 *   activeAllSplit: boolean,
 *   setActiveAllSplit: (all: boolean) => void
 * }} Layout context values and setters.
 */
export const useLayout = () => {
    const context = useContext(LayoutContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

/**
 * Custom React hook to access and manage header state via HeaderContext.
 *
 * @function useHeader
 * @throws {Error} Throws an error if the hook is used outside of a HeaderContext provider.
 * @returns {{
 *   active: string,
 *   setActive: (active: string) => void
 * }} Header context values and setter.
 */
export const useHeader = () => {
    const context = useContext(HeaderContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

/**
 * Extracts a list of season names from the provided seasons array.
 *
 * @function getSeason
 * @param {SeasonData[]} seasons - Array of season objects.
 * @returns {string[]} List of season names.
 */
const getSeason = (seasons: SeasonData[]): string[] => {
    return seasons.map((season) => season.season)
}

/**
 * Retrieves all split names associated with a given season key.
 *
 * @function getSplits
 * @param {string} seasonKey - The key identifying the target season.
 * @param {SeasonData[]} seasons - Array of season objects.
 * @returns {string[]} An array of valid split names for the selected season.
 */
const getSplits = (seasonKey: string, seasons: SeasonData[]): string[] => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season || !season.data) return []
    return season.data
        .map((split) => split.split)
        .filter((split): split is string => typeof split === 'string')
}


/**
 * Retrieves tournament data for a given season and optional split.
 * Adds a synthetic "All" tournament entry if `isAllActive` is true and not already present.
 *
 * @function getTournaments
 * @param {string} seasonKey - The key identifying the target season.
 * @param {string} splitKey - The key identifying the target split (can be empty).
 * @param {SeasonData[]} seasons - Array of season objects.
 * @param {boolean} isAllActive - Whether the "All" tournament option should be included.
 * @returns {(Tournament & { allId?: number[] })[]} List of tournaments with optional allId for "All".
 */
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

/**
 * Collects all tournament IDs from every season and split.
 *
 * @function getAllIds
 * @param {SeasonData[]} seasons - Array of season objects.
 * @returns {number[]} Flattened array of all tournament IDs.
 */
const getAllIds = (seasons: SeasonData[]): number[] => {
    return seasons.flatMap((season) =>
        season.data.flatMap(
            (split) => split.tournaments?.map((t) => t.id) || []
        )
    )
}

/**
 * Retrieves all tournament IDs for a specific season.
 *
 * @function getIdsBySeason
 * @param {string} seasonKey - The season identifier.
 * @param {SeasonData[]} seasons - Array of season objects.
 * @returns {number[]} List of tournament IDs for the specified season.
 */
const getIdsBySeason = (seasonKey: string, seasons: SeasonData[]): number[] => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season) return []

    return season.data.flatMap(
        (split) => split.tournaments?.map((t) => t.id) || []
    )
}

/**
 * Finds the ID of a tournament by name within a specific season and optional split.
 *
 * @function getTournamentId
 * @param {SeasonData[]} seasons - Array of season objects.
 * @param {string} seasonKey - The season in which to search.
 * @param {string|null} splitKey - Optional split name to narrow down the search.
 * @param {string} tournamentName - Name of the tournament to find.
 * @returns {number|undefined} The ID of the matching tournament, or undefined if not found.
 */
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

/**
 * TableEntityLayout – Provides shared layout and context for Table Entity views.
 *
 * Wraps children components in a flex container and provides a centralized context (LayoutContext)
 * to manage active selection states across splits, tournaments, and seasons. This allows child components
 * to read and update global UI selections consistently. Useful in dashboards or views with dynamic filters.
 *
 * @function TableEntityLayout
 *
 * @param {React.ReactNode} children - Child components to be rendered inside the layout.
 * @param {string} [className=''] - Optional. Additional class names for styling.
 *
 * @returns {JSX.Element} A layout wrapper with context for state management.
 *
 * @example
 * <TableEntityLayout>
 *   <TableEntityHeader seasons={seasonData} />
 * </TableEntityLayout>
 */
export const TableEntityLayout = ({ children, className = '' }: MainProps) => {
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

/**
 * TableEntityHeader – Renders season, split, and tournament selectors with contextual logic.
 *
 * Allows users to filter data based on selected season, split, and tournament. Syncs the selection
 * state via LayoutContext and HeaderContext. Handles logic for defaulting to latest available items.
 *
 * @function TableEntityHeader
 *
 * @param {Season[]} seasons - List of season objects with split and tournament info.
 * @param {string} [className=''] - Optional. Additional class names for styling.
 * @param {number[]} [all=[]] - Optional. List of all disable indices (used to determine "All" status).
 *
 * @returns {JSX.Element} UI with dynamic tabs for filtering by season, split, and tournament.
 *
 * @example
 * <TableEntityHeader seasons={mySeasons} all={[1, 2]} />
 */
export const TableEntityHeader = ({
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
                <TableEntityRawSelect
                    data={seasonTab}
                    isAllActive={isAllActive}
                    allId={allId}
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
        </HeaderContext.Provider>
    )
}

/**
 * TableEntityRawSelect – Dropdown selector for choosing a specific season or selecting "All".
 *
 * Provides a dropdown UI to choose a season, and an "All" option to activate all seasons.
 * Updates global layout state and resets related selections accordingly.
 *
 * @function TableEntityRawSelect
 *
 * @param {string[]} data - List of seasons to display in the dropdown.
 * @param {boolean} isAllActive - Indicates if the "All" option should be shown.
 * @param {number[]} allId - IDs to be set when "All" is selected.
 * @param {string} [className=''] - Optional. Additional class names for styling.
 *
 * @returns {JSX.Element} A dropdown menu to select a season and a toggle for "All".
 *
 * @example
 * <TableEntityRawSelect data={["2022", "2023"]} isAllActive={true} allId={[1,2,3]} />
 */
const TableEntityRawSelect = ({
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
                            activeAllSeason ? 'text-grey' : 'text-white'
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

/**
 * TableEntityRawSplit – Renders split options as toggleable tabs and manages related state updates.
 *
 * Allows users to select specific splits within a season, or choose "All" splits.
 * Automatically updates tournament selections when split changes.
 *
 * @function TableEntityRawSplit
 *
 * @param {string[]} data - List of split names to display.
 * @param {boolean} isAllActive - Determines visibility of "All" toggle.
 * @param {number[]} allId - IDs to apply when "All" is selected.
 * @param {Season[]} seasons - Complete list of season data for context.
 * @param {string} [className=''] - Optional. Additional class names for styling.
 *
 * @returns {JSX.Element} A group of selectable split tabs and "All" toggle.
 *
 * @example
 * <TableEntityRawSplit data={["Spring", "Summer"]} isAllActive={true} allId={[4, 5]} seasons={seasons} />
 */
const TableEntityRawSplit = ({
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

/**
 * TableEntityRawTournament – Displays tournament selection options and manages their selection state.
 *
 * Provides tabs for users to select tournaments within a split. Automatically updates global state
 * with the selected tournament and corresponding IDs.
 *
 * @function TableEntityRawTournament
 *
 * @param {Tournament[]} data - List of tournaments to display as options.
 * @param {string} [className = ''] - Optional. Additional class names for styling.
 *
 * @returns {JSX.Element} A horizontal list of clickable tournament tabs.
 *
 * @example
 * <TableEntityRawTournament data={[{ tournament: "Playoffs", id: 2 }]} />
 */
const TableEntityRawTournament = ({
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

/**
 * TableEntityBody – Displays only the active child component based on the current layout index.
 *
 * This component receives children and a class name. It uses the `useLayout` context to determine
 * which child (by index) should be rendered, based on the current `activeIndex`. It ensures that only
 * one child component is visible at a time. If a child is not a valid React element, it shows an error fallback.
 *
 * @function TableEntityBody
 *
 * @param {ReactNode} children - All child components to potentially render.
 * @param {string} [className=''] - Optional. Additional class names for the wrapper div.
 *
 * @returns {ReactElement} A single child component corresponding to the active index, or an error message.
 *
 * @example
 * <TableEntityBody className="my-custom-class">
 *   <Tab1 />
 *   <Tab2 />
 * </TableEntityBody>
 *
 * @see useLayout
 */
export const TableEntityBody = ({ children, className = '' }: MainProps) => {
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

/**
 * TableEntityContent – Provides structural layout for nested content inside a table entity.
 *
 * A simple wrapper component that arranges its children in a vertical column with spacing,
 * and full height/width. It's mostly used to enforce a consistent layout for content areas.
 *
 * @function TableEntityContent
 *
 * @param {ReactNode} children - The content to render inside the layout.
 * @param {string} [className=''] - Optional. Additional class names for styling.
 *
 * @returns {ReactElement} A styled wrapper div containing the provided children.
 *
 * @example
 * <TableEntityContent className="py-4">
 *   <SomeComponent />
 *   <AnotherComponent />
 * </TableEntityContent>
 */
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
