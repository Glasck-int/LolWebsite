import React from 'react'
import Image from 'next/image'
import { Column } from '../types'
import { Form } from '@/components/utils/Form'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'

/**
 * Type definition for different standings display modes.
 *
 * @typedef {'matches' | 'games'} StandingsType
 * - 'matches': Display match series statistics (best-of-X series results)
 * - 'games': Display individual game statistics (single game results)
 */
export type StandingsType = 'matches' | 'games'

/**
 * Configuration interface for the useStandingsColumns hook.
 *
 * Defines how standings columns should be generated and displayed,
 * including which type of statistics to show, responsive behavior,
 * and customization options.
 *
 * @interface StandingsColumnsConfig
 */
export interface StandingsColumnsConfig {
    /**
     * Type of standings to display - affects which statistics columns are shown.
     * 'matches' shows series-level stats, 'games' shows individual game stats.
     */
    type: StandingsType

    /**
     * Whether columns should be sortable (show sort controls in headers).
     * @default true
     */
    sortable?: boolean

    /**
     * Whether to include a form/trend indicator column showing recent performance.
     * @default true
     */
    includeForm?: boolean

    /**
     * Whether to optimize the column set for mobile display by filtering out desktop-only columns.
     * @default false
     */
    mobileOptimized?: boolean

    /**
     * Custom array of column keys to include. When provided, only these columns will be shown.
     * Useful for creating specialized views with specific data sets.
     */
    customColumns?: string[]

    /**
     * Group name to display instead of "Team" in the header.
     * When provided, replaces the default "Team" header with the group name.
     */
    groupName?: string
}

/**
 * Main hook for generating standings table column configurations.
 *
 * This hook provides a flexible system for creating column definitions for standings tables.
 * It supports different statistical views (matches vs games), responsive design considerations,
 * internationalization, and customizable column sets. The hook generates complete column
 * configurations including cell renderers, headers, tooltips, and styling.
 *
 * @param config - Configuration object specifying the desired column setup
 * @returns Object containing columns array and utility functions for grid layout
 *
 * @example
 * ```tsx
 * // Basic matches standings
 * const { columns, getGridTemplate } = useStandingsColumns({
 *   type: 'matches',
 *   sortable: true,
 *   includeForm: true
 * });
 *
 * // Mobile-optimized games standings
 * const { columns } = useStandingsColumns({
 *   type: 'games',
 *   mobileOptimized: true,
 *   customColumns: ['place', 'team', 'gamesWins', 'gamesLosses']
 * });
 *
 * // Custom column set
 * const { columns } = useStandingsColumns({
 *   type: 'matches',
 *   customColumns: ['place', 'team', 'played', 'winRate']
 * });
 * ```
 */
export const useStandingsColumns = (config: StandingsColumnsConfig) => {
    const {
        type,
        sortable = true,
        includeForm = true,
        mobileOptimized = false,
        customColumns,
        groupName,
    } = config
    const t = useTranslate('Standings')

    /** CSS class for team name hover effects */
    const teamHover = 'hover:text-clear-violet/80 transition-all duration-200'

    /**
     * Base columns that appear in all standings tables.
     * Includes position/place and team information with logos.
     * These columns form the foundation of every standings display.
     */
    const baseColumns: Column<ProcessedStanding>[] = [
        {
            key: 'place',
            header: '#',
            cell: ({ standing }, sortedPosition) => (
                <p>{sortedPosition ?? standing.place}.</p>
            ),
            tooltip: t('#'),
            headerClassName: 'cursor-pointer flex items-center justify-center',
            className: 'text-center cursor-pointer flex-shrink-0 ',
            sortable,
        },
        {
            key: 'team',
            header: groupName || t('Team'),
            cell: ({ standing, teamImage, teamData }) => (
                <div className="flex gap-2">
                    {teamImage ? (
                        <Image
                            src={teamImage}
                            alt={standing.team || ''}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 flex-shrink-0" />
                    )}
                    <p
                        className={`hidden lg:block justify-start items-center ${teamHover} min-w-0 flex-1`}
                    >
                        {standing.team}
                    </p>
                    <p
                        className={`block lg:hidden ${teamHover} min-w-0 flex-1`}
                    >
                        {teamData?.short}
                    </p>
                </div>
            ),
            tooltip: groupName ? `${t('GroupTooltip')}` : t('GroupTooltip'),
            headerClassName: 'justify-start  flex-1 min-w-0',
            className: 'justify-start items-center flex-1 min-w-0',
            sortable: false,
        },
    ]

    const matchesColumns: Column<ProcessedStanding>[] = [
        {
            key: 'played',
            header: 'J',
            tooltip: t('MatchesPlayedTooltip'),
            cell: ({ totalMatches }) => <p>{totalMatches}</p>,
            headerClassName: 'flex items-center justify-center',
            className: 'flex items-center justify-center',
            sortable,
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            cell: ({ standing }) => <p>{standing.winSeries}</p>,
            headerClassName: 'flex items-center justify-center',
            className: 'flex items-center justify-center',
            sortable,
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            cell: ({ standing }) => <p>{standing.lossSeries}</p>,
            headerClassName: 'flex items-center justify-center',
            className: 'flex items-center justify-center',
            sortable,
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            cell: ({ matchWinRate }) => <p>{matchWinRate}%</p>,
            headerClassName: 'flex items-center justify-center',
            className: 'flex items-center justify-center',
            sortable,
        },
        {
            key: 'form',
            header: t('Form'),
            tooltip: t('FormTooltip'),
            cell: ({ teamsRecentMatches, standing }) =>
                teamsRecentMatches ? (
                    <Form
                        teamsRecentMatches={
                            teamsRecentMatches ? [teamsRecentMatches] : []
                        }
                        standing={standing}
                    />
                ) : null,
            headerClassName:
                'text-center hidden md:flex flex-shrink-0 min-w-[120px] justify-start px-2',
            className:
                'text-center hidden md:flex flex-shrink-0 min-w-[120px] justify-start px-2',
            sortable,
        },
    ]

    const gamesColumns: Column<ProcessedStanding>[] = [
        {
            key: 'played',
            header: 'J',
            tooltip: t('GamesPlayedTooltip'),
            cell: ({ gamesStats }) => <p>{gamesStats.totalGames}</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            cell: ({ gamesStats }) => <p>{gamesStats.wins}</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            cell: ({ gamesStats }) => <p>{gamesStats.losses}</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            cell: ({ gamesStats }) => <p>{gamesStats.winRate}%</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'form',
            header: t('Form'),
            tooltip: t('FormTooltip'),
            cell: ({ gamesStats, standing }) =>
                gamesStats.recentGames ? (
                    <Form
                        teamsRecentGames={gamesStats.recentGames}
                        standing={standing}
                    />
                ) : null,
            headerClassName:
                'text-center hidden md:flex flex-shrink-0 min-w-[120px] justify-start px-2',
            className:
                'text-center hidden md:flex flex-shrink-0 min-w-[120px] justify-start px-2',
            sortable,
        },
    ]

    const specificColumns = type === 'games' ? gamesColumns : matchesColumns
    let allColumns = [...baseColumns, ...specificColumns]

    // Filter columns if customColumns is specified
    if (customColumns) {
        allColumns = allColumns.filter((col) => customColumns.includes(col.key))
    }

    // Filter the Form column if necessary
    if (!includeForm) {
        allColumns = allColumns.filter((col) => col.key !== 'form')
    }

    // Automatic mobile optimization
    if (mobileOptimized) {
        allColumns = getMobileColumns(allColumns)
    }

    return allColumns
}

/**
 * Generates CSS Grid template strings for responsive standings layouts.
 *
 * Provides predefined grid column sizing that ensures proper alignment
 * and spacing across different device types. The grid template defines
 * the width allocation for each column type.
 *
 * @param isMobile - Whether to return mobile-optimized grid template
 * @returns CSS Grid template string for use in gridTemplateColumns
 *
 * @example
 * ```tsx
 * const gridTemplate = getGridTemplate(false); // Desktop: "40px 1fr 40px 40px 40px 50px 180px"
 * const mobileGrid = getGridTemplate(true);    // Mobile: "40px 1fr 40px 40px 40px 50px"
 * ```
 */
export const getGridTemplate = (isMobile: boolean) => {
    if (isMobile) {
        return '40px 1fr 40px 40px 40px 50px'
    } else {
        return '40px 1fr 40px 40px 40px 50px 180px'
    }
}

/**
 * Filters column array to remove desktop-only columns for mobile display.
 *
 * Examines column configurations and removes any columns that have
 * responsive CSS classes indicating they should be hidden on mobile
 * devices (e.g., 'hidden md:flex', 'hidden lg:flex').
 *
 * @param columns - Array of column configurations to filter
 * @returns Filtered array containing only mobile-appropriate columns
 *
 * @example
 * ```tsx
 * const allColumns = useStandingsColumns({ type: 'matches' }).columns;
 * const mobileColumns = getMobileColumns(allColumns);
 * ```
 */
export const getMobileColumns = (columns: Column<ProcessedStanding>[]) => {
    return columns.filter((col) => {
        const isDesktopOnly =
            col.headerClassName?.includes('hidden md:flex') ||
            col.headerClassName?.includes('hidden lg:flex') ||
            col.className?.includes('hidden md:flex') ||
            col.className?.includes('hidden lg:flex')
        return !isDesktopOnly
    })
}

/**
 * Pre-configured hook for matches standings columns.
 *
 * Convenience hook that automatically sets the type to 'matches' and allows
 * additional configuration options to be passed through.
 *
 * @param options - Additional configuration options (excluding type)
 * @returns Configured standings columns for match series display
 *
 * @example
 * ```tsx
 * const { columns } = useMatchesColumns({
 *   sortable: true,
 *   includeForm: false
 * });
 * ```
 */
export const useMatchesColumns = (
    options: Omit<StandingsColumnsConfig, 'type'> = {}
) => useStandingsColumns({ type: 'matches', ...options })

/**
 * Pre-configured hook for games standings columns.
 *
 * Convenience hook that automatically sets the type to 'games' and allows
 * additional configuration options to be passed through.
 *
 * @param options - Additional configuration options (excluding type)
 * @returns Configured standings columns for individual games display
 *
 * @example
 * ```tsx
 * const { columns } = useGamesColumns({
 *   mobileOptimized: true,
 *   sortable: false
 * });
 * ```
 */
export const useGamesColumns = (
    options: Omit<StandingsColumnsConfig, 'type'> = {}
) => useStandingsColumns({ type: 'games', ...options })

/**
 * Compact standings columns hook for simplified displays.
 *
 * Provides a minimal set of columns focusing on essential statistics:
 * position, team, games played, wins, losses, and win rate.
 * Excludes form indicators for a cleaner, more compact layout.
 *
 * @param type - Type of standings (matches or games)
 * @returns Compact column configuration with essential stats only
 *
 * @example
 * ```tsx
 * const { columns } = useCompactStandingsColumns('matches');
 * ```
 */
export const useCompactStandingsColumns = (type: StandingsType) =>
    useStandingsColumns({
        type,
        customColumns: ['place', 'team', 'played', 'wins', 'losses', 'winRate'],
        includeForm: false,
    })

/**
 * Mobile-optimized standings columns hook.
 *
 * Provides a minimal column set optimized for mobile display with only
 * the most essential information: position, team, games played, and win rate.
 * Automatically enables mobile optimization to filter out desktop-only styling.
 *
 * @param type - Type of standings (matches or games)
 * @returns Mobile-optimized column configuration
 *
 * @example
 * ```tsx
 * const { columns } = useMobileStandingsColumns('games');
 * ```
 */
export const useMobileStandingsColumns = (type: StandingsType) =>
    useStandingsColumns({
        type,
        mobileOptimized: true,
        customColumns: ['place', 'team', 'played', 'winRate'],
    })

/**
 * Hook for combined standings columns showing both matches and games statistics side by side.
 *
 * This specialized hook creates a comprehensive view that displays both match series
 * and individual game statistics in a single table. Columns are prefixed to distinguish
 * between match-level stats (M-) and game-level stats (G-) for clarity.
 *
 * Ideal for providing a complete statistical overview when users need to see both
 * series performance and individual game performance simultaneously.
 *
 * @param sortable - Whether the columns should be sortable
 * @returns Combined column configuration with both matches and games statistics
 *
 * @example
 * ```tsx
 * // Combined view with sorting enabled
 * const { columns, getCombinedGridTemplate } = useCombinedStandingsColumns(true);
 *
 * // Read-only combined view
 * const { columns } = useCombinedStandingsColumns(false);
 * ```
 */
export const useCombinedStandingsColumns = (
    sortable: boolean = true,
    groupName?: string
) => {
    const t = useTranslate('Standings')
    const teamHover = 'hover:text-clear-violet/80 transition-all duration-200'

    const baseColumns: Column<ProcessedStanding>[] = [
        {
            key: 'place',
            header: '#',
            cell: ({ standing }, sortedPosition) => (
                <p>{sortedPosition ?? standing.place}.</p>
            ),
            tooltip: t('#'),
            headerClassName: 'cursor-pointer flex items-center justify-center',
            className:
                'text-center justify-center items-center cursor-pointer flex-shrink-0 ',
            sortable,
        },
        {
            key: 'team',
            header: groupName || t('Team'),
            cell: ({ standing, teamImage, teamData }) => (
                <div className="flex gap-2">
                    {teamImage ? (
                        <Image
                            src={teamImage}
                            alt={standing.team || ''}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 flex-shrink-0" />
                    )}
                    <p
                        className={`hidden lg:block justify-start items-center ${teamHover} min-w-0 flex-1`}
                    >
                        {standing.team}
                    </p>
                    <p
                        className={`block lg:hidden ${teamHover} min-w-0 flex-1`}
                    >
                        {teamData?.short}
                    </p>
                </div>
            ),
            tooltip: groupName ? `${t('GroupTooltip')}` : t('GroupTooltip'),
            headerClassName: 'justify-start items-center flex-1 min-w-0',
            className: 'justify-start items-center flex-1 min-w-0',
            sortable: false,
        },
    ]

    const matchesStatsColumns: Column<ProcessedStanding>[] = [
        {
            key: 'matchesPlayed',
            header: 'J',
            tooltip: t('MatchesPlayedTooltip'),
            cell: ({ totalMatches }) => <p>{totalMatches}</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'matchesWins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            cell: ({ standing }) => <p>{standing.winSeries}</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'matchesLosses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            cell: ({ standing }) => <p>{standing.lossSeries}</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'matchesWinRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            cell: ({ matchWinRate }) => <p>{matchWinRate}%</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
    ]

    const gamesStatsColumns: Column<ProcessedStanding>[] = [
        {
            key: 'gamesPlayed',
            header: 'J',
            tooltip: t('GamesPlayedTooltip'),
            cell: ({ gamesStats }) => <p>{gamesStats.totalGames}</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'gamesWins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            cell: ({ gamesStats }) => <p>{gamesStats.wins}</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'gamesLosses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            cell: ({ gamesStats }) => <p>{gamesStats.losses}</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
        {
            key: 'gamesWinRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            cell: ({ gamesStats }) => <p>{gamesStats.winRate}%</p>,
            headerClassName: '',
            className: '',
            sortable,
        },
    ]

    const formColumn: Column<ProcessedStanding>[] = [
        {
            key: 'form',
            header: t('Form'),
            tooltip: t('FormTooltip'),
            cell: ({ teamsRecentMatches, standing }) =>
                teamsRecentMatches ? (
                    <Form
                        teamsRecentMatches={
                            teamsRecentMatches ? [teamsRecentMatches] : []
                        }
                        standing={standing}
                    />
                ) : null,
            headerClassName:
                'text-center hidden md:flex flex-shrink-0 min-w-[120px] justify-start px-2',
            className:
                'text-center hidden md:flex flex-shrink-0 min-w-[120px] justify-start px-2',
            sortable,
        },
    ]

    return [
        ...baseColumns,
        ...matchesStatsColumns,
        ...gamesStatsColumns,
        ...formColumn,
    ]
}

/**
 * Generates CSS Grid template strings for combined standings layouts (matches + games).
 *
 * Provides specialized grid column sizing for the combined view that displays
 * both match series and individual game statistics side by side. The template
 * accounts for the increased number of columns in this view.
 *
 * @param isMobile - Whether to return mobile-optimized grid template
 * @returns CSS Grid template string optimized for combined view layout
 *
 * @example
 * ```tsx
 * const combinedGrid = getCombinedGridTemplate(false);
 * // Desktop: "40px 1fr 40px 40px 40px 50px 40px 40px 40px 50px 180px"
 *
 * const mobileCombined = getCombinedGridTemplate(true);
 * // Mobile: "40px 1fr 40px 40px 40px 50px 40px 40px 40px 50px"
 * ```
 */
export const getCombinedGridTemplate = (isMobile: boolean) => {
    if (isMobile) {
        // Place + Team + 4 columns matches + 4 columns games = 10 columns
        return '40px 1fr 40px 40px 40px 50px 40px 40px 40px 50px'
    } else {
        // Place + Team + 4 columns matches + 4 columns games + Form = 11 columns
        return '40px 1fr 50px 50px 50px 50px 50px 50px 50px 50px 180px'
    }
}

/**
 * Determines background CSS classes for columns based on their statistical category.
 *
 * Applies visual grouping through background colors to distinguish between
 * different types of statistics in combined views. Matches statistics get
 * one background color, games statistics get another, and other columns
 * remain uncolored.
 *
 * @param columnKey - The key identifier of the column
 * @returns CSS class string for appropriate background styling
 *
 * @example
 * ```tsx
 * getColumnBackgroundClass('matchesWins');    // Returns 'bg-clear-violet/10'
 * getColumnBackgroundClass('gamesWins');      // Returns 'bg-blue/10'
 * getColumnBackgroundClass('team');           // Returns ''
 * ```
 */
export const getColumnBackgroundClass = (columnKey: string) => {
    if (
        [
            'matchesPlayed',
            'matchesWins',
            'matchesLosses',
            'matchesWinRate',
        ].includes(columnKey)
    ) {
        return 'bg-clear-violet/10'
    }
    if (
        ['gamesPlayed', 'gamesWins', 'gamesLosses', 'gamesWinRate'].includes(
            columnKey
        )
    ) {
        return 'bg-blue/10'
    }
    return ''
}
