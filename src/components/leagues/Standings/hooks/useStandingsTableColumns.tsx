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
            headerClassName: 'text-left w-12 md:w-16 cursor-pointer flex items-center justify-start pl-2',
            cellClassName: 'text-left font-medium cursor-pointer flex-shrink-0 w-12 md:w-16 pl-2',
            accessor: (item) => item.standing.place,
            cell: (item, index) => `${item.standing.place}.`
        },
        {
            key: 'team',
            header: groupName || t('Team'),
            tooltip: groupName ? `${t('GroupTooltip')}` : t('GroupTooltip'),
            sortable: false,
            headerClassName: 'justify-start items-center flex-1 min-w-0 pl-4',
            cellClassName: 'justify-start items-center flex-1 min-w-0 pl-4',
            cell: (item) => (
                <div className="flex items-center">
                    {item.teamImage ? (
                        <Image
                            src={item.teamImage}
                            alt={item.standing.team || ''}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain flex-shrink-0 mr-4"
                        />
                    ) : (
                        <div className="w-6 h-6 flex-shrink-0 mr-1" />
                    )}
                    <p className={`hidden lg:block ${teamHover}`}>
                        {item.standing.team}
                    </p>
                    <p className={`block lg:hidden ${teamHover}`}>
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
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.totalMatches,
            cell: (item) => item.totalMatches
        },
        {
            key: 'wins',  
            header: 'W',
            tooltip: t('WinsTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.standing.winSeries,
            cell: (item) => item.standing.winSeries
        },
        {
            key: 'losses',
            header: 'L', 
            tooltip: t('LossesTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.standing.lossSeries,
            cell: (item) => item.standing.lossSeries
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.matchWinRate,
            cell: (item) => `${item.matchWinRate}%`
        }
    ] : [
        {
            key: 'played',
            header: 'J',
            tooltip: t('GamesPlayedTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.gamesStats.totalGames,
            cell: (item) => item.gamesStats.totalGames
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.gamesStats.wins,
            cell: (item) => item.gamesStats.wins
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.gamesStats.losses,
            cell: (item) => item.gamesStats.losses
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
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
        headerClassName: 'text-left pl-2 hidden md:block min-w-[100px]',
        cellClassName: 'text-left pl-2 hidden md:block min-w-[100px] flex items-center justify-start',
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
            headerClassName: 'text-left w-12 md:w-16 pl-2',
            cellClassName: 'text-left font-medium w-12 md:w-16 pl-2',
            accessor: (item) => item.standing.place,
            cell: (item) => `${item.standing.place}.`
        },
        {
            key: 'team',
            header: groupName || t('Team'),
            tooltip: groupName ? `${t('GroupTooltip')}` : t('GroupTooltip'),
            sortable: false,
            headerClassName: 'text-left w-full pl-4',
            cellClassName: 'text-left justify-start pl-4',
            cell: (item) => (
                <div className="flex items-center ">
                    {item.teamImage ? (
                        <Image
                            src={item.teamImage}
                            alt={item.standing.team || ''}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain flex-shrink-0 mr-4"
                        />
                    ) : (
                        <div className="w-6 h-6 flex-shrink-0 mr-1" />
                    )}
                    <p className={`hidden lg:block ${teamHover}`}>
                        {item.standing.team}
                    </p>
                    <p className={`block lg:hidden ${teamHover}`}>
                        {item.teamData?.short || item.standing.team}
                    </p>
                </div>
            )
        },
        
        // Matches stats
        {
            key: 'matchesPlayed',
            header: 'J',
            tooltip: t('MatchesPlayedTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.totalMatches,
            cell: (item) => item.totalMatches
        },
        {
            key: 'matchesWins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.standing.winSeries,
            cell: (item) => item.standing.winSeries
        },
        {
            key: 'matchesLosses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.standing.lossSeries,
            cell: (item) => item.standing.lossSeries
        },
        {
            key: 'matchesWinRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            sortable,
            headerClassName: 'text-center px-0 w-12 md:px-1 lg:px-2', 
            cellClassName: 'text-center px-0 w-12 md:px-1 lg:px-2',
            accessor: (item) => item.matchWinRate,
            cell: (item) => `${item.matchWinRate}%`
        },

        // Games stats  
        {
            key: 'gamesPlayed',
            header: 'J',
            tooltip: t('GamesPlayedTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.gamesStats.totalGames,
            cell: (item) => item.gamesStats.totalGames
        },
        {
            key: 'gamesWins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.gamesStats.wins,
            cell: (item) => item.gamesStats.wins
        },
        {
            key: 'gamesLosses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.gamesStats.losses,
            cell: (item) => item.gamesStats.losses
        },
        {
            key: 'gamesWinRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            sortable,
            headerClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            cellClassName: 'text-center px-1 w-12 md:px-3 lg:px-4 md:min-w-14',
            accessor: (item) => item.gamesStats.winRate,
            cell: (item) => `${item.gamesStats.winRate}%`
        },

        // Form column
        {
            key: 'form',
            header: t('Form'),
            tooltip: t('FormTooltip'),
            sortable: false,
            headerClassName: 'text-left pl-2 hidden md:block min-w-[100px]',
            cellClassName: 'text-left pl-2 hidden md:block min-w-[100px] flex items-center justify-start',
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