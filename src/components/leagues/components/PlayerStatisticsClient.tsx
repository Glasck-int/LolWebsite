'use client'

import React from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { SortableTable, TableColumn } from '@/components/ui/table/SortableTable'
import { PlayerStats, getTournamentPlayerStats, TournamentPlayerStatsResponse } from '@/lib/api/players'
import { useBatchPlayerImages } from '@/lib/hooks/usePlayerImageCache'
import { CleanName } from '@/lib/utils/cleanName'
import { MatchSkeleton } from '@/components/ui/skeleton/MatchSkeleton'
import Link from 'next/link'
import {
    Card,
    CardContext,
    CardBody,
    CardHeader,
    CardHeaderColumn,
    CardHeaderTab,
    CardHeaderContent,
    useCard,
} from '@/components/ui/card/index'

interface PlayerStatisticsClientProps {
    tournamentId: string
    initialData?: TournamentPlayerStatsResponse | null
}

/**
 * Tab content component that uses the card context
 */
function PlayerTabContent({ data, tabColumns }: { 
    data: TournamentPlayerStatsResponse, 
    tabColumns: TableColumn<PlayerStats>[][] 
}) {
    const { activeIndex } = useCard()
    
    return (
        <CardBody className="p-0">
            <div className="w-full overflow-hidden">
                <SortableTable
                    data={data.players}
                    columns={tabColumns[activeIndex]}
                    showSectionHeaders={false}
                    getRowKey={(item, index) => `${item.player}-${item.team || ''}-${item.role || ''}-${index}`}
                    emptyState="No player data available"
                    className="w-full text-xs table-fixed"
                />
            </div>
        </CardBody>
    )
}

/**
 * Client Component for Player Statistics with SWR caching
 * Works with dynamic tournamentId changes
 */

export function PlayerStatisticsClient({ tournamentId, initialData }: PlayerStatisticsClientProps) {
    const { data, error, isLoading } = useSWR(
        tournamentId ? `player-stats-${tournamentId}` : null,
        async () => {
            const response = await getTournamentPlayerStats(tournamentId)
            if (response.error) throw new Error(response.error)
            return response.data
        },
        {
            fallbackData: initialData || undefined,
            revalidateOnFocus: false,
            revalidateOnMount: true, // Always fetch on mount to ensure fresh data
            revalidateOnReconnect: false, // Don't refetch on reconnection
            dedupingInterval: 300000, // 5 minutes deduplication
            errorRetryCount: 1,
            refreshInterval: 0 // Disable automatic refresh
        }
    )

    // Prepare players list for batch image loading
    const playersForImages = data?.players?.map(player => ({
        player: player.player,
        role: player.role
    })) || []

    // Use the cached batch image hook - this will persist across page navigations
    // Pass undefined as tournament if not available yet, hook will use default cache key
    const { 
        batchImageData: playerImages
    } = useBatchPlayerImages(playersForImages, data?.tournament || undefined)

    if (isLoading) {
        return (
            <MatchSkeleton className='min-h-[1280px]' />
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="text-clear-grey text-center">
                    <div className="font-medium">No player statistics for this tournament</div>
                </div>
            </div>
        )
    }

    if (!data || !data.players.length) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">No player data available</div>
            </div>
        )
    }

    const classname = "text-base w-10 "
    const importantColor = "bg-clear-violet/20 "
    const importantYellow = "bg-yellow/20 "
    
    const playerColumn: TableColumn<PlayerStats> = {
        key: 'player',
        header: 'Player',
        sortable: true,
        headerClassName: 'text-left justify-start font-semibold w-40',
        cellClassName: 'font-semibold text-sm w-40',
        accessor: (item) => item.name || item.player,
        cell: (item) => {
            const playerImageData = playerImages?.[item.player]
            const hasPlayerImage = playerImageData?.playerImage
            const hasRoleImage = playerImageData?.roleImage
            
            return (
                <div className="flex items-center gap-2">
                    {/* Player Image */}
                    {hasPlayerImage ? (
                        <div className="relative flex-shrink-0">
                            <Image
                                src={playerImageData?.playerImage || ''}
                                alt={`${item.name || item.player} avatar`}
                                width={32}
                                height={32}
                                className="rounded-full object-cover aspect-square"
                                onError={(e) => {
                                    // Hide image on error
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-dark-grey to-clear-violet/50 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-white"
                            >
                                <path
                                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                    fill="currentColor"
                                    opacity="0.9"
                                />
                                <path
                                    d="M3 22C3 17.5817 6.58172 14 11 14H13C17.4183 14 21 17.5817 21 22H3Z"
                                    fill="currentColor"
                                    opacity="0.8"
                                />
                            </svg>
                        </div>
                    )}
                    
                    {/* Role Image */}
                    {hasRoleImage && (
                        <div className="relative flex-shrink-0">
                            <Image
                                src={playerImageData?.roleImage || ''}
                                alt={`${item.role || 'Unknown'} role`}
                                width={20}
                                height={20}
                                className="object-contain"
                                onError={(e) => {
                                    // Hide image on error
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>
                    )}
                    
                    <Link href={`/players/${encodeURIComponent(item.player)}`} className="truncate hover:text-clear-violet transition-colors">
                    {/* Player Name */}
                        {CleanName(item.name || item.player)}
                    </Link>
                </div>
            )
        },
    }

    const positionColumn: TableColumn<PlayerStats> = {
        key: 'position',
        header: '#',
        sortable: false,
        headerClassName: 'w-8',
        cellClassName: 'font-semibold text-base',
        cell: (_, position) => <>{position}.</>,
    }

    // Tab 1: Position + Player + GP + WR + KDA
    const tab1Columns: TableColumn<PlayerStats>[] = [
        positionColumn,
        playerColumn,
        {
            key: 'gamesPlayed',
            header: 'GP',
            tooltip: 'Games Played',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.gamesPlayed || 0,
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: 'Win Rate',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.winRate,
            cell: (item) => `${item.winRate.toFixed(0)}%`,
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'kda',
            header: 'KDA',
            tooltip: 'Kill/Death/Assist Ratio',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.kda,
            cell: (item) => item.kda.toFixed(2),
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
    ]

    // Tab 2: Position + Player + K + D + A + KP
    const tab2Columns: TableColumn<PlayerStats>[] = [
        positionColumn,
        playerColumn,
        {
            key: 'avgKills',
            header: 'K',
            tooltip: 'Average Kills',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgKills,
            cell: (item) => item.avgKills.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'avgDeaths',
            header: 'D',
            tooltip: 'Average Deaths',
            sortable: true,
            accessor: (item) => item.avgDeaths,
            cell: (item) => item.avgDeaths.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'avgAssists',
            header: 'A',
            tooltip: 'Average Assists',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgAssists,
            cell: (item) => item.avgAssists.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'avgKillParticipation',
            header: 'KP',
            tooltip: 'Average Kill Participation',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgKillParticipation,
            cell: (item) => `${item.avgKillParticipation.toFixed(0)}%`,
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
    ]

    // Tab 3: Position + Player + Gold + CS + DPM + VS
    const tab3Columns: TableColumn<PlayerStats>[] = [
        positionColumn,
        playerColumn,
        {
            key: 'avgGoldPerMinute',
            header: 'GPM',
            tooltip: 'Average Gold Per Minute',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgGoldPerMinute,
            cell: (item) => Math.round(item.avgGoldPerMinute).toString(),
            headerClassName: classname,
            cellClassName: classname + importantYellow,
        },
        {
            key: 'avgCsPerMinute',
            header: 'CSPM',
            tooltip: 'Average CS Per Minute',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgCsPerMinute,
            cell: (item) => item.avgCsPerMinute.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantYellow,
        },
        {
            key: 'avgDamagePerMinute',
            header: 'DPM',
            tooltip: 'Average Damage Per Minute',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgDamagePerMinute,
            cell: (item) => Math.round(item.avgDamagePerMinute).toString(),
            headerClassName: classname,
            cellClassName: classname + importantYellow,
        },
        {
            key: 'avgVisionScore',
            header: 'VS',
            tooltip: 'Average Vision Score',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgVisionScore,
            cell: (item) => item.avgVisionScore.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantYellow,
        },
    ]

    // All columns for desktop
    const allColumns: TableColumn<PlayerStats>[] = [
        positionColumn,
        playerColumn,
        {
            key: 'gamesPlayed',
            header: 'GP',
            tooltip: 'Games Played',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.gamesPlayed || 0,
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: 'Win Rate',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.winRate,
            cell: (item) => `${item.winRate.toFixed(0)}%`,
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: 'Wins',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.wins,
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: 'Losses',
            sortable: true,
            accessor: (item) => item.losses,
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'kda',
            header: 'KDA',
            tooltip: 'Kill/Death/Assist Ratio',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.kda,
            cell: (item) => item.kda.toFixed(2),
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'avgKills',
            header: 'K',
            tooltip: 'Average Kills',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgKills,
            cell: (item) => item.avgKills.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'avgDeaths',
            header: 'D',
            tooltip: 'Average Deaths',
            sortable: true,
            accessor: (item) => item.avgDeaths,
            cell: (item) => item.avgDeaths.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'avgAssists',
            header: 'A',
            tooltip: 'Average Assists',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgAssists,
            cell: (item) => item.avgAssists.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'avgKillParticipation',
            header: 'KP',
            tooltip: 'Average Kill Participation',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgKillParticipation,
            cell: (item) => `${item.avgKillParticipation.toFixed(0)}%`,
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'avgGoldPerMinute',
            header: 'G/M',
            tooltip: 'Average Gold Per Minute',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgGoldPerMinute,
            cell: (item) => Math.round(item.avgGoldPerMinute).toString(),
            headerClassName: classname,
            cellClassName: classname + importantYellow,
        },
        {
            key: 'avgCsPerMinute',
            header: 'CS/M',
            tooltip: 'Average CS Per Minute',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgCsPerMinute,
            cell: (item) => item.avgCsPerMinute.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantYellow,
        },
        {
            key: 'avgDamagePerMinute',
            header: 'DPM',
            tooltip: 'Average Damage Per Minute',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgDamagePerMinute,
            cell: (item) => Math.round(item.avgDamagePerMinute).toString(),
            headerClassName: classname,
            cellClassName: classname + importantYellow,
        },
        {
            key: 'avgVisionScore',
            header: 'VS',
            tooltip: 'Average Vision Score',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgVisionScore,
            cell: (item) => item.avgVisionScore.toFixed(1),
            headerClassName: classname,
            cellClassName: classname + importantYellow,
        },
        {
            key: 'uniqueChampions',
            header: 'UC',
            tooltip: 'Unique Champions Played',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.uniqueChampions,
            headerClassName: classname,
            cellClassName: classname,
        },
    ]

    const tabColumns = [tab1Columns, tab2Columns, tab3Columns]

    return (
        <>
            {/* Desktop version - all columns */}
            <div className="hidden md:block w-full h-full">
                <Card className="flex flex-col w-full h-full">
                    <CardContext>
                        <CardBody className="p-0">
                            <div className="w-full overflow-hidden">
                                <SortableTable
                                    data={data.players}
                                    columns={allColumns}
                                    showSectionHeaders={false}
                                    getRowKey={(item, index) => `${item.player}-${item.team || ''}-${item.role || ''}-${index}`}
                                    emptyState="No player data available"
                                    caption={`Player Statistics ${data.tournament}`}
                                    className="w-full text-xs table-fixed"
                                />
                            </div>
                        </CardBody>
                    </CardContext>
                </Card>
            </div>

            {/* Mobile version - with tabs */}
            <div className="block md:hidden w-full h-full">
                <Card className="flex flex-col w-full h-full">
                    <CardContext>
                        <CardHeader>
                            <CardHeaderColumn>
                                <CardHeaderTab>
                                    <CardHeaderContent>
                                        <p className="text-inherit">Performance</p>
                                    </CardHeaderContent>
                                    <CardHeaderContent>
                                        <p className="text-inherit">Combat</p>
                                    </CardHeaderContent>
                                    <CardHeaderContent>
                                        <p className="text-inherit">Economy</p>
                                    </CardHeaderContent>
                                </CardHeaderTab>
                            </CardHeaderColumn>
                        </CardHeader>
                        <PlayerTabContent data={data} tabColumns={tabColumns} />
                    </CardContext>
                </Card>
            </div>
        </>
    )
}