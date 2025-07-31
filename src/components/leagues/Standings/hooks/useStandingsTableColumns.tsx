import React from 'react'
import Image from 'next/image'
import { TableColumn } from '@/components/ui/table'
import { Form } from '@/components/utils/Form'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'

/**
 * Configuration for standings table columns
 */
export interface StandingsTableConfig {
    /** Type of standings to display */
    type: 'matches' | 'games'
    /** Whether to include form column */
    includeForm?: boolean
    /** Custom group name for header */
    groupName?: string
    /** Whether columns should be sortable */
    sortable?: boolean
}

/**
 * Simplified hook for generating standings table columns.
 * Uses the new TableColumn interface for better type safety and reusability.
 */
export const useStandingsTableColumns = (config: StandingsTableConfig): TableColumn<ProcessedStanding>[] => {
    const {
        type,
        includeForm = true,
        groupName,
        sortable = true
    } = config
    
    const t = useTranslate('Standings')
    const teamHover = 'hover:text-clear-violet/80 transition-all duration-200'

    // Base columns (position and team)
    const baseColumns: TableColumn<ProcessedStanding>[] = [
        {
            key: 'place',
            header: '#',
            tooltip: t('#'),
            sortable,
            headerClassName: 'text-center w-12 cursor-pointer flex items-center justify-center',
            cellClassName: 'text-center font-medium cursor-pointer flex-shrink-0',
            accessor: (item) => item.standing.place,
            cell: (item, index) => `${item.standing.place}.`
        },
        {
            key: 'team',
            header: groupName || t('Team'),
            tooltip: groupName ? `${t('GroupTooltip')}` : t('GroupTooltip'),
            sortable: false,
            headerClassName: 'justify-start items-center flex-1 min-w-0',
            cellClassName: 'justify-start items-center flex-1 min-w-0',
            cell: (item) => (
                <div className="flex items-center gap-4">
                    {item.teamImage ? (
                        <Image
                            src={item.teamImage}
                            alt={item.standing.team || ''}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 flex-shrink-0" />
                    )}
                    <p className={`hidden lg:block justify-start items-center ${teamHover} min-w-0 flex-1`}>
                        {item.standing.team}
                    </p>
                    <p className={`block lg:hidden ${teamHover} min-w-0 flex-1`}>
                        {item.teamData?.short || item.standing.team}
                    </p>
                </div>
            )
        }
    ]

    // Statistics columns based on type
    const statsColumns: TableColumn<ProcessedStanding>[] = type === 'matches' ? [
        {
            key: 'played',
            header: 'J',
            tooltip: t('MatchesPlayedTooltip'),
            sortable,
            headerClassName: 'flex items-center justify-center',
            cellClassName: 'flex items-center justify-center',
            accessor: (item) => item.totalMatches,
            cell: (item) => item.totalMatches
        },
        {
            key: 'wins',  
            header: 'W',
            tooltip: t('WinsTooltip'),
            sortable,
            headerClassName: 'flex items-center justify-center',
            cellClassName: 'flex items-center justify-center',
            accessor: (item) => item.standing.winSeries,
            cell: (item) => item.standing.winSeries
        },
        {
            key: 'losses',
            header: 'L', 
            tooltip: t('LossesTooltip'),
            sortable,
            headerClassName: 'flex items-center justify-center',
            cellClassName: 'flex items-center justify-center',
            accessor: (item) => item.standing.lossSeries,
            cell: (item) => item.standing.lossSeries
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            sortable,
            headerClassName: 'flex items-center justify-center',
            cellClassName: 'flex items-center justify-center',
            accessor: (item) => item.matchWinRate,
            cell: (item) => `${item.matchWinRate}%`
        }
    ] : [
        {
            key: 'played',
            header: 'J',
            tooltip: t('GamesPlayedTooltip'),
            sortable,
            headerClassName: '',
            cellClassName: '',
            accessor: (item) => item.gamesStats.totalGames,
            cell: (item) => item.gamesStats.totalGames
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            sortable,
            headerClassName: '',
            cellClassName: '',
            accessor: (item) => item.gamesStats.wins,
            cell: (item) => item.gamesStats.wins
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            sortable,
            headerClassName: '',
            cellClassName: '',
            accessor: (item) => item.gamesStats.losses,
            cell: (item) => item.gamesStats.losses
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            sortable,
            headerClassName: '',
            cellClassName: '',
            accessor: (item) => item.gamesStats.winRate,
            cell: (item) => `${item.gamesStats.winRate}%`
        }
    ]

    // Form column
    const formColumn: TableColumn<ProcessedStanding>[] = includeForm ? [{
        key: 'form',
        header: t('Form'),
        tooltip: t('FormTooltip'),
        sortable: false,
        headerClassName: 'text-left hidden md:block',
        cellClassName: 'text-left hidden md:block justify-start',
        cell: (item) => {
            if (type === 'matches' && item.teamsRecentMatches) {
                return (
                    <Form
                        teamsRecentMatches={[item.teamsRecentMatches]}
                        standing={item.standing}
                    />
                )
            }
            if (type === 'games' && item.gamesStats.recentGames) {
                return (
                    <Form
                        teamsRecentGames={item.gamesStats.recentGames}
                        standing={item.standing}
                    />
                )
            }
            return null
        }
    }] : []

    return [...baseColumns, ...statsColumns, ...formColumn]
}

/**
 * Hook for combined standings showing both matches and games statistics
 */
export const useCombinedStandingsTableColumns = (config: Omit<StandingsTableConfig, 'type'>): TableColumn<ProcessedStanding>[] => {
    const { groupName, sortable = true } = config
    const t = useTranslate('Standings')
    const teamHover = 'hover:text-clear-violet/80 transition-all duration-200'

    return [
        // Base columns
        {
            key: 'place',
            header: '#',
            tooltip: t('#'),
            sortable,
            headerClassName: 'text-center w-12',
            cellClassName: 'text-center font-medium w-12',
            accessor: (item) => item.standing.place,
            cell: (item) => `${item.standing.place}.`
        },
        {
            key: 'team',
            header: groupName || t('Team'),
            tooltip: groupName ? `${t('GroupTooltip')}` : t('GroupTooltip'),
            sortable: false,
            headerClassName: 'text-left w-full',
            cellClassName: 'text-left w-full',
            cell: (item) => (
                <div className="flex items-center gap-3">
                    {item.teamImage ? (
                        <Image
                            src={item.teamImage}
                            alt={item.standing.team || ''}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain flex-shrink-0"
                        />
                    ) : (
                        <div className="w-6 h-6 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                        <p className={`hidden lg:block ${teamHover}`}>
                            {item.standing.team}
                        </p>
                        <p className={`block lg:hidden ${teamHover}`}>
                            {item.teamData?.short || item.standing.team}
                        </p>
                    </div>
                </div>
            )
        },
        
        // Matches stats
        {
            key: 'matchesPlayed',
            header: 'J',
            tooltip: t('MatchesPlayedTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-10',
            cellClassName: 'text-center px-1 w-10',
            accessor: (item) => item.totalMatches,
            cell: (item) => item.totalMatches
        },
        {
            key: 'matchesWins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-10',
            cellClassName: 'text-center px-1 w-10',
            accessor: (item) => item.standing.winSeries,
            cell: (item) => item.standing.winSeries
        },
        {
            key: 'matchesLosses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-10',
            cellClassName: 'text-center px-1 w-10',
            accessor: (item) => item.standing.lossSeries,
            cell: (item) => item.standing.lossSeries
        },
        {
            key: 'matchesWinRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            sortable,
            headerClassName: 'text-center px-2', 
            cellClassName: 'text-center px-2',
            accessor: (item) => item.matchWinRate,
            cell: (item) => `${item.matchWinRate}%`
        },

        // Games stats  
        {
            key: 'gamesPlayed',
            header: 'J',
            tooltip: t('GamesPlayedTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-10',
            cellClassName: 'text-center px-1 w-10',
            accessor: (item) => item.gamesStats.totalGames,
            cell: (item) => item.gamesStats.totalGames
        },
        {
            key: 'gamesWins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-10',
            cellClassName: 'text-center px-1 w-10',
            accessor: (item) => item.gamesStats.wins,
            cell: (item) => item.gamesStats.wins
        },
        {
            key: 'gamesLosses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-10',
            cellClassName: 'text-center px-1 w-10',
            accessor: (item) => item.gamesStats.losses,
            cell: (item) => item.gamesStats.losses
        },
        {
            key: 'gamesWinRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-10',
            cellClassName: 'text-center px-1 w-10',
            accessor: (item) => item.gamesStats.winRate,
            cell: (item) => `${item.gamesStats.winRate}%`
        },

        // Form column
        {
            key: 'form',
            header: t('Form'),
            tooltip: t('FormTooltip'),
            sortable: false,
            headerClassName: 'text-right hidden md:block w-40',
            cellClassName: 'text-right hidden md:block w-40',
            cell: (item) => {
                if (item.teamsRecentMatches) {
                    return (
                        <Form
                            teamsRecentMatches={[item.teamsRecentMatches]}
                            standing={item.standing}
                        />
                    )
                }
                return null
            }
        }
    ]
}