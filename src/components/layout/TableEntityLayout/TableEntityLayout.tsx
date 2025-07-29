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

export interface MainProps {
    children: React.ReactNode
    className?: string
}

interface HeaderProps {
    seasons: SeasonData[]
    className?: string
    allExcluded?: number[]
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

/**
 * Extracts all season names from the provided season data.
 *
 * Maps the input array of season objects to an array of their string identifiers.
 *
 * @param seasons - Array of SeasonData objects
 * @returns An array of season names as strings
 *
 * @example
 * ```ts
 * const result = getSeason(seasons);
 * console.log(result); // ['2023', '2024', ...]
 * ```
 *
 * @remarks
 * Useful for populating dropdowns or UI components with season values.
 */
export const getSeason = (seasons: SeasonData[]): string[] => {
    return seasons.map((season) => season.season)
}

/**
 * Retrieves all split identifiers associated with a specific season.
 *
 * Searches for the matching season and returns an array of split strings.
 *
 * @param seasonKey - The name of the selected season
 * @param seasons - Array of SeasonData objects
 * @returns An array of split names as strings for the selected season
 *
 * @example
 * ```ts
 * const result = getSplits('2024', seasons);
 * console.log(result); // ['Spring', 'Summer']
 * ```
 *
 * @remarks
 * Returns an empty array if the season or its data is not found.
 */
export const getSplits = (seasonKey: string, seasons: SeasonData[]): string[] => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season || !season.data) return []
    return season.data
        .map((split) => split.split)
        .filter((split): split is string => typeof split === 'string')
}

/**
 * Retrieves the tournaments for a given season and split.
 *
 * Depending on the active state and split, this will return relevant tournaments and optionally include an "All" entry.
 *
 * @param seasonKey - The currently selected season
 * @param splitKey - The selected split for the season
 * @param seasons - Array of SeasonData objects
 * @param isAllActive - Indicates whether the "All" option should be added
 * @returns An array of Tournament objects, optionally including an "All" entry with associated IDs
 *
 * @example
 * ```ts
 * const tournaments = getTournaments('2024', 'Summer', seasons, true);
 * ```
 *
 * @remarks
 * If `isAllActive` is true and no "All" tournament is found, it creates one with all existing IDs.
 */
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

/**
 * Flattens all tournament IDs from all seasons and splits into a single array.
 *
 * Iterates through all data to collect every tournament ID.
 *
 * @param seasons - Array of SeasonData objects
 * @returns A flat array of all tournament IDs
 *
 * @example
 * ```ts
 * const ids = getAllIds(seasons);
 * ```
 *
 * @remarks
 * Useful for implementing a global "All" selection.
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
 * Filters and flattens IDs only for the selected season.
 *
 * @param seasonKey - The name of the selected season
 * @param seasons - Array of SeasonData objects
 * @returns An array of tournament IDs for the given season
 *
 * @example
 * ```ts
 * const ids = getIdsBySeason('2024', seasons);
 * ```
 *
 * @remarks
 * Returns an empty array if the season is not found.
 */
const getIdsBySeason = (seasonKey: string, seasons: SeasonData[]): number[] => {
    const season = seasons.find((s) => s.season === seasonKey)
    if (!season) return []

    return season.data.flatMap(
        (split) => split.tournaments?.map((t) => t.id) || []
    )
}

/**
 * TableEntityLayout component
 *
 * Renders a vertical layout wrapper for children components in the table entity UI.
 *
 * @param children - React children elements to be rendered inside the layout
 * @param className - Optional Tailwind CSS classes for additional styling
 * @returns A flex column wrapper for UI content
 *
 * @example
 * ```tsx
 * <TableEntityLayout>
 *   <MyComponent />
 * </TableEntityLayout>
 * ```
 *
 * @remarks
 * Commonly used to structure table-based UI in a clean vertical stack
 */
export const TableEntityLayout = ({ children, className = '' }: MainProps) => {
    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {children}
        </div>
    )
}

/**
 * TableEntityHeader component
 *
 * Renders dynamic dropdowns and tabs for selecting season, split, and tournament in a table UI.
 *
 * @param seasons - An array of SeasonData used to populate selection dropdowns
 * @param className - Optional Tailwind CSS classes for styling
 * @param allExcluded - Optional array of index values where "All" should not be active
 * @returns A composed header UI with season, split, and tournament controls
 *
 * @example
 * ```tsx
 * <TableEntityHeader seasons={seasonList} />
 * ```
 *
 * @remarks
 * Handles reactive selection logic using Zustand store and useEffect to sync data
 */
export const TableEntityHeader = ({
    seasons,
    className = '',
    allExcluded = [],
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
        typeof activeIndex === 'number' && allExcluded.includes(activeIndex)
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

/**
 * TableEntityRawSelect component
 *
 * Renders a dropdown for selecting a season or activating "All" mode.
 *
 * @param data - An array of season strings to populate the select dropdown
 * @param isAllActive - Boolean flag indicating whether the "All" button is active
 * @param allId - Array of tournament IDs for "All" selection
 * @param seasons - Full season data used for selection context
 * @param className - Optional Tailwind classes for additional layout styling
 * @returns A select UI for choosing a season, with optional "All" shortcut
 *
 * @example
 * ```tsx
 * <TableEntityRawSelect data={["2023", "2024"]} isAllActive={true} allId={[1,2,3]} seasons={seasons} />
 * ```
 *
 * @remarks
 * Interacts with Zustand store to manage selection state and propagate changes
 */
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


/**
 * TableEntityRawSplit component
 *
 * Displays a set of clickable tabs to choose a split within a season or activate "All".
 *
 * @param data - An array of split strings to render as clickable tabs
 * @param isAllActive - Boolean to indicate whether the "All" split selection is active
 * @param allId - Array of tournament IDs for selecting all splits
 * @param seasons - Complete season data for contextual operations
 * @param className - Optional Tailwind CSS class for styling the component
 * @returns UI elements allowing users to switch between splits or activate "All"
 *
 * @example
 * ```tsx
 * <TableEntityRawSplit data={["Spring", "Summer"]} seasons={seasons} />
 * ```
 *
 * @remarks
 * Uses Zustand store actions to update selection state for splits
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

/**
 * TableEntityRawTournament component
 *
 * Renders a set of clickable tournament options, optionally including an "All" option.
 *
 * @param data - Array of Tournament objects to render as selectable buttons
 * @param className - Optional styling for the container
 * @returns A set of styled tabs or buttons representing available tournaments
 *
 * @example
 * ```tsx
 * <TableEntityRawTournament data={[{ id: 1, tournament: "PlayOff" }]} />
 * ```
 *
 * @remarks
 * Dynamically highlights active selection and dispatches updates through Zustand store
 */
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

/**
 * TableEntityBody component
 *
 * Wraps the body content of the table entity layout with optional styling and filtering.
 *
 * @param children - React nodes to be rendered in the body
 * @param className - Optional Tailwind classes for styling
 * @returns A container for displaying filtered content based on tournament selection
 *
 * @example
 * ```tsx
 * <TableEntityBody>
 *   <ContentGrid />
 * </TableEntityBody>
 * ```
 *
 * @remarks
 * Uses activeIndex from Zustand store to filter or conditionally render content if needed
 */
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