import React from 'react'
import Image from 'next/image'
import { Column } from '../types'
import { Form } from '@/components/utils/Form'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'

export type StandingsType = 'matches' | 'games'

export interface StandingsColumnsConfig {
    type: StandingsType
    sortable?: boolean
    includeForm?: boolean
    mobileOptimized?: boolean
    customColumns?: string[]
}

export const useStandingsColumns = (config: StandingsColumnsConfig) => {
    const {
        type,
        sortable = true,
        includeForm = true,
        mobileOptimized = false,
        customColumns
    } = config
    const t = useTranslate('Standings')
    const teamHover = 'hover:text-clear-violet/80 transition-all duration-200'

    const baseColumns: Column<ProcessedStanding>[] = [
        {
            key: 'place',
            header: '#',
            cell: ({ standing }, sortedPosition) => <p>{sortedPosition ?? standing.place}.</p>,
            tooltip: t('#'),
            headerClassName: 'cursor-pointer flex items-center justify-center',
            className: 'text-center cursor-pointer flex-shrink-0 ' ,
            sortable,
        },
        {
            key: 'team',
            header: t('Team'),
            cell: ({ standing, teamImage, teamData }) => (
                <div className="flex items-center gap-4">
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
            headerClassName: 'justify-start items-center flex-1 min-w-0',
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
            headerClassName: 'text-left hidden md:flex flex-shrink-0 w-42 ml-4',
            className: 'text-left hidden md:flex flex-shrink-0 w-42',
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
            headerClassName: 'text-left hidden md:flex flex-shrink-0 w-42 ml-4',
            className: 'text-left hidden md:flex flex-shrink-0 w-42',
            sortable,
        },
    ]

    const specificColumns = type === 'games' ? gamesColumns : matchesColumns
    let allColumns = [...baseColumns, ...specificColumns]

    // Filter columns if customColumns is specified
    if (customColumns) {
        allColumns = allColumns.filter(col => customColumns.includes(col.key))
    }

    // Filter the Form column if necessary
    if (!includeForm) {
        allColumns = allColumns.filter(col => col.key !== 'form')
    }

    // Automatic mobile optimization
    if (mobileOptimized) {
        allColumns = getMobileColumns(allColumns)
    }

    return allColumns
}

export const getGridTemplate = (isMobile: boolean) => {
    if (isMobile) {
        return '40px 1fr 40px 40px 40px 50px'
    } else {
        return '40px 1fr 40px 40px 40px 50px 180px'
    }
}

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

export const useMatchesColumns = (options: Omit<StandingsColumnsConfig, 'type'> = {}) =>
    useStandingsColumns({ type: 'matches', ...options })

export const useGamesColumns = (options: Omit<StandingsColumnsConfig, 'type'> = {}) =>
    useStandingsColumns({ type: 'games', ...options })

export const useCompactStandingsColumns = (type: StandingsType) =>
    useStandingsColumns({
        type,
        customColumns: ['place', 'team', 'played', 'wins', 'losses', 'winRate'],
        includeForm: false
    })

export const useMobileStandingsColumns = (type: StandingsType) =>
    useStandingsColumns({
        type,
        mobileOptimized: true,
        customColumns: ['place', 'team', 'played', 'winRate']
    })

// Hook for combined columns (matches + games side by side)
export const useCombinedStandingsColumns = (sortable: boolean = true) => {
    const t = useTranslate('Standings')
    const teamHover = 'hover:text-clear-violet/80 transition-all duration-200'

    const baseColumns: Column<ProcessedStanding>[] = [
        {
            key: 'place',
            header: '#',
            cell: ({ standing }, sortedPosition) => <p>{sortedPosition ?? standing.place}.</p>,
            tooltip: t('#'),
            headerClassName: 'cursor-pointer flex items-center justify-center',
            className: 'text-center justify-center items-center cursor-pointer flex-shrink-0 ',
            sortable,
        },
        {
            key: 'team',
            header: t('Team'),
            cell: ({ standing, teamImage, teamData }) => (
                <div className="flex items-center gap-4">
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
            headerClassName: 'text-left hidden md:flex flex-shrink-0 w-42 ml-4',
            className: 'text-left hidden md:flex flex-shrink-0 w-42',
            sortable,
        },
    ]

    return [
        ...baseColumns,
        ...matchesStatsColumns,
        ...gamesStatsColumns,
        ...formColumn
    ]
}

export const getCombinedGridTemplate = (isMobile: boolean) => {
    if (isMobile) {
        // Place + Team + 4 columns matches + 4 columns games = 10 columns  
        return '40px 1fr 40px 40px 40px 50px 40px 40px 40px 50px'
    } else {
        // Place + Team + 4 columns matches + 4 columns games + Form = 11 columns
        return '40px 1fr 40px 40px 40px 50px 40px 40px 40px 50px 180px'
    }
}

// Helper to get the CSS classes for the background by section
export const getColumnBackgroundClass = (columnKey: string) => {
    if (['matchesPlayed', 'matchesWins', 'matchesLosses', 'matchesWinRate'].includes(columnKey)) {
        return 'bg-clear-violet/10'
    }
    if (['gamesPlayed', 'gamesWins', 'gamesLosses', 'gamesWinRate'].includes(columnKey)) {
        return 'bg-blue/10'
    }
    return ''
}