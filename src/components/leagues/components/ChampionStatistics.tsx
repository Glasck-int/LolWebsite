'use client'

import React, { useEffect, useState } from 'react'
import { SortableTable, TableColumn } from '@/components/ui/table/SortableTable'
import { getTournamentChampionStats, ChampionStats, TournamentChampionStatsResponse } from '@/lib/api/champions'
import { SubTitle } from '@/components/ui/text/SubTitle'
import {
    Card,
    CardContext,
    CardBody,
    CardHeader,
    CardHeaderBase,
} from '@/components/ui/card/index'
import Image from 'next/image'
import { DDragon } from '@/lib/api/ddragon'

interface ChampionStatisticsProps {
    tournamentId: string
}

/**
 * Champion Statistics component that displays tournament champion data using SortableTable
 */
export function ChampionStatistics({ tournamentId }: ChampionStatisticsProps) {
    const [data, setData] = useState<TournamentChampionStatsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [ddragonVersion, setDdragonVersion] = useState<string>('14.24.1') // Default version

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            
            try {
                // Fetch DDragon version and champion stats in parallel
                const [versionsResponse, statsResponse] = await Promise.all([
                    DDragon.getVersions(),
                    getTournamentChampionStats(tournamentId)
                ])
                
                if (versionsResponse && versionsResponse.length > 0) {
                    setDdragonVersion(versionsResponse[0])
                }
                
                if (statsResponse.error) {
                    setError(statsResponse.error)
                } else if (statsResponse.data) {
                    setData(statsResponse.data)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch champion statistics')
            } finally {
                setLoading(false)
            }
        }

        if (tournamentId) {
            fetchData()
        }
    }, [tournamentId])

    const classname = "text-base w-10 "
    // Define table columns for champion statistics
    const columns: TableColumn<ChampionStats>[] = [
        {
            key: 'position',
            header: '#',
            sortable: false,
            headerClassName: 'w-8 left-0 z-10',
            cellClassName: 'font-semibold text-base left-0 z-10',
            cell: (_, position) => position,
        },
        {
            key: 'champion',
            header: 'Champion',
            sortable: true,
            headerClassName: 'text-left font-semibold w-32',
            cellClassName: 'font-semibold  text-sm w-32',
            accessor: (item) => item.champion,
            cell: (item) => {
                // Map champion names to DDragon format (handle special cases)
                const championNameForDDragon = item.champion
                    .replace(/[\s']/g, '') // Remove spaces and apostrophes
                    .replace(/&/g, '') // Remove ampersands
                    .replace(/\./g, '') // Remove dots
                    .replace(/([a-z])([A-Z])/g, '$1$2') // Keep camelCase
                    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                
                // Special cases mapping
                const specialCases: Record<string, string> = {
                    'Wukong': 'MonkeyKing',
                    'RenataGlasc': 'Renata',
                    'Nunu&Willump': 'Nunu',
                    'K\'Sante': 'KSante',
                    'Bel\'Veth': 'Belveth',
                    'Cho\'Gath': 'Chogath',
                    'Kai\'Sa': 'Kaisa',
                    'Kha\'Zix': 'Khazix',
                    'LeBlanc': 'Leblanc',
                    'Vel\'Koz': 'Velkoz',
                    'Rek\'Sai': 'RekSai'
                }
                
                const ddragonName = specialCases[item.champion] || championNameForDDragon
                const imageUrl = DDragon.getChampionIcon(ddragonVersion, ddragonName)
                
                return (
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0">
                            <Image
                                src={imageUrl}
                                alt={item.champion}
                                width={24}
                                height={24}
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <span className="">{item.champion}</span>
                    </div>
                )
            },
        },
        {
            key: 'gamesPlayed',
            header: 'GP',
            tooltip: 'Games Played',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.gamesPlayed,
            headerClassName: classname,
            cellClassName: classname,
        },
                {
            key: 'uniquePlayers',
            header: 'Pl',
            tooltip: 'Number of Unique Players',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.uniquePlayers,
            headerClassName: classname,
            cellClassName: classname    ,
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: 'Win Rate Percentage',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.winRate,
            cell: (item) => `${item.winRate.toFixed(1)}%`,
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: 'Wins',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.wins,
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: 'Losses',
            sortable: true,
            accessor: (item) => item.losses,
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'pickRate',
            header: 'PR',
            tooltip: 'Pick Rate Percentage',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.pickRate || 0,
            cell: (item) => item.pickRate ? `${item.pickRate.toFixed(1)}%` : '0.0%',
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'banRate',
            header: 'BR',
            tooltip: 'Ban Rate Percentage',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.banRate || 0,
            cell: (item) => item.banRate ? `${item.banRate.toFixed(1)}%` : '0.0%',
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'presenceRate',
            header: 'Pr',
            tooltip: 'Tournament Presence Rate (Picks + Bans)',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.presenceRate || 0,
            cell: (item) => item.presenceRate ? `${item.presenceRate.toFixed(1)}%` : '0.0%',
            headerClassName: classname,
            cellClassName: classname,
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
            cellClassName: classname,
        },
        {
            key: 'avgKills',
            header: 'K',
            tooltip: 'Average Kills per Game',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgKills,
            cell: (item) => item.avgKills.toFixed(1),
            cellClassName: classname,
            headerClassName: classname,
        },
        {
            key: 'avgDeaths',
            header: 'D',
            tooltip: 'Average Deaths per Game',
            sortable: true,
            accessor: (item) => item.avgDeaths,
            cell: (item) => item.avgDeaths.toFixed(1),
            cellClassName: classname,
            headerClassName: classname,
        },
        {
            key: 'avgAssists',
            header: 'A',
            tooltip: 'Average Assists per Game',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgAssists,
            cell: (item) => item.avgAssists.toFixed(1),
            cellClassName: classname,
            headerClassName: classname,
        },
        {
            key: 'avgKillParticipation',
            header: 'KP',
            tooltip: 'Average Kill Participation Percentage',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgKillParticipation,
            cell: (item) => `${item.avgKillParticipation.toFixed(1)}%`,
            cellClassName: classname,
            headerClassName: classname,
        },
        {
            key: 'avgGold',
            header: 'Gold',
            tooltip: 'Average Gold per Game',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgGold,
            cell: (item) => `${(item.avgGold / 1000).toFixed(1)}k`,
            cellClassName: classname,
            headerClassName: classname,
        },
        {
            key: 'avgCs',
            header: 'CS',
            tooltip: 'Average Creep Score per Game',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgCs,
            cell: (item) => item.avgCs.toFixed(0),
            cellClassName: classname,
            headerClassName: classname,
        },
        {
            key: 'avgDamagePerMinute',
            header: 'DPM',
            tooltip: 'Average Damage per Minute',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgDamagePerMinute,
            cell: (item) => Math.round(item.avgDamagePerMinute).toString(),
            cellClassName: classname,
            headerClassName: classname,
        },

    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading champion statistics...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-red-500">Error: {error}</div>
            </div>
        )
    }

    if (!data || !data.champions.length) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">No champion statistics available for this tournament</div>
            </div>
        )
    }

    return (
        <Card className="flex flex-col w-full h-full">
            <CardContext>
                <CardHeader>
                    <CardHeaderBase>
                        <div className="flex items-center justify-between w-full px-4 py-3">
                            <SubTitle className="text-clear-grey">
                                Champion Statistics - {data.tournament}
                            </SubTitle>
                            <div className="text-sm text-muted-foreground">
                                {data.totalGames} games • {data.uniqueChampions} unique champions
                            </div>
                        </div>
                    </CardHeaderBase>
                </CardHeader>
                <CardBody className="p-0">
                    <div className="w-full overflow-hidden">
                        <SortableTable
                            data={data.champions}
                            columns={columns}
                            showSectionHeaders={false}
                            getRowKey={(item) => item.champion}
                            emptyState="No champion data available"
                            caption={`Champion statistics for ${data.tournament}`}
                            className="w-full text-xs table-fixed"
                        />
                    </div>
                </CardBody>
            </CardContext>
        </Card>
    )
}