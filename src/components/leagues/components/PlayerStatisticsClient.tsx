'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { SortableTable, TableColumn } from '@/components/ui/table/SortableTable'
import { PlayerStats, getTournamentPlayerStats, TournamentPlayerStatsResponse } from '@/lib/api/players'
import { getPlayerImage } from '@/lib/api/player'
import { getTeamImageByName } from '@/lib/api/image'
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
                    getRowKey={(item) => item.player}
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
    const [playerImages, setPlayerImages] = useState<Record<string, { playerImage: string; teamImage: string }>>({})
    const [imagesLoading, setImagesLoading] = useState(false)

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
            revalidateOnMount: !initialData, // Don't revalidate if we have initial data
            dedupingInterval: 60000, // 1 minute
            errorRetryCount: 1
        }
    )

    // Fetch player and team images when data changes
    useEffect(() => {
        if (!data?.players || data.players.length === 0) {
            setPlayerImages({})
            return
        }

        const fetchData = async () => {
            setImagesLoading(true)
            
            const dataPromises = data.players.map(async (player) => {
                try {
                    // Get player image using the player name and tournament
                    const playerImageResponse = await getPlayerImage(player.player, data.tournament)
                    
                    // Get team image using team name (we'll need to derive this from player data)
                    // For now, we'll use an empty string as we don't have team info in PlayerStats
                    const teamImageResponse = { data: '' }
                    
                    return {
                        playerName: player.player,
                        playerImage: playerImageResponse.data || '',
                        teamImage: teamImageResponse.data || '',
                    }
                } catch (error) {
                    console.error(`Failed to fetch data for player ${player.player}:`, error)
                    return {
                        playerName: player.player,
                        playerImage: '',
                        teamImage: '',
                    }
                }
            })

            try {
                const results = await Promise.all(dataPromises)
                const imagesMap = results.reduce(
                    (acc, { playerName, playerImage, teamImage }) => {
                        acc[playerName] = { playerImage, teamImage }
                        return acc
                    },
                    {} as Record<string, { playerImage: string; teamImage: string }>
                )
                setPlayerImages(imagesMap)
            } catch (error) {
                console.error('Failed to fetch player data:', error)
            } finally {
                setImagesLoading(false)
            }
        }

        fetchData()
    }, [data])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-2">
                <div className="text-muted-foreground">Loading player statistics...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="text-red-500 text-center">
                    <div className="font-medium">Error loading player statistics</div>
                    <div className="text-sm mt-1">{error.message}</div>
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
        accessor: (item) => item.player,
        cell: (item) => {
            const playerImageData = playerImages[item.player]
            const hasPlayerImage = playerImageData?.playerImage
            
            return (
                <div className="flex items-center gap-2">
                    {/* Player Image */}
                    {hasPlayerImage ? (
                        <div className="relative flex-shrink-0">
                            <Image
                                src={playerImageData.playerImage}
                                alt={`${item.player} avatar`}
                                width={24}
                                height={24}
                                className="rounded-full object-cover aspect-square"
                                onError={(e) => {
                                    // Hide image on error
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                                {item.player.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    
                    {/* Player Name */}
                    <span className="truncate">{item.player}</span>
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
        {
            key: 'uniqueChampions',
            header: 'Champions',
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
                                    getRowKey={(item) => item.player}
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