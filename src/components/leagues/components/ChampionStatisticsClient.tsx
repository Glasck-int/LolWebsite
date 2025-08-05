'use client'

import React from 'react'
import useSWR from 'swr'
import { SortableTable, TableColumn } from '@/components/ui/table/SortableTable'
import { ChampionStats, getTournamentChampionStats, TournamentChampionStatsResponse } from '@/lib/api/champions'
import {
    Card,
    CardContext,
    CardBody,
} from '@/components/ui/card/index'
import Image from 'next/image'
import { DDragon } from '@/lib/api/ddragon'
import { useDDragonVersions } from '@/lib/swr/useDDragonVersions'

interface ChampionStatisticsClientProps {
    tournamentId: string
    initialData?: TournamentChampionStatsResponse | null
}

/**
 * Client Component for Champion Statistics with SWR caching
 * Works with dynamic tournamentId changes
 */
export function ChampionStatisticsClient({ tournamentId, initialData }: ChampionStatisticsClientProps) {
    const { latestVersion: ddragonVersion } = useDDragonVersions()
    
    const { data, error, isLoading } = useSWR(
        tournamentId ? `champion-stats-${tournamentId}` : null,
        async () => {
            const response = await getTournamentChampionStats(tournamentId)
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


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-2">
                <div className="text-muted-foreground">Loading champion statistics...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="text-red-500 text-center">
                    <div className="font-medium">Error loading champion statistics</div>
                    <div className="text-sm mt-1">{error.message}</div>
                </div>
            </div>
        )
    }

    if (!data || !data.champions.length) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">No champion data available</div>
            </div>
        )
    }

    const classname = "text-base w-10 "
    const importantColor = "bg-clear-violet/20 "
    const importantYellow = "bg-yellow/20 "
    
    const championColumn: TableColumn<ChampionStats> = {
        key: 'champion',
        header: 'Champion',
        sortable: true,
        headerClassName: 'text-left justify-start font-semibold w-32',
        cellClassName: 'font-semibold text-sm w-32',
        accessor: (item) => item.champion,
        cell: (item) => {
            const championNameForDDragon = item.champion
                .replace(/[\s']/g, '')
                .replace(/&/g, '')
                .replace(/\./g, '')
                .replace(/([a-z])([A-Z])/g, '$1$2')
                .replace(/^./, str => str.toUpperCase())
                
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
                    <span>{item.champion}</span>
                </div>
            )
        },
    }

    const columns: TableColumn<ChampionStats>[] = [
        {
            key: 'position',
            header: '#',
            sortable: false,
            headerClassName: 'w-8',
            cellClassName: 'font-semibold text-base',
            cell: (_, position) => <>{position}.</>,
        },
        championColumn,
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
            key: 'presenceRate',
            header: 'Pr',
            tooltip: 'Presence Rate',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.presenceRate || 0,
            cell: (item) => item.presenceRate ? `${item.presenceRate.toFixed(0)}%` : '0%',
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'pickRate',
            header: 'PR',
            tooltip: 'Pick Rate',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.pickRate || 0,
            cell: (item) => item.pickRate ? `${item.pickRate.toFixed(0)}%` : '0%',
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'banRate',
            header: 'BR',
            tooltip: 'Ban Rate',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.banRate || 0,
            cell: (item) => item.banRate ? `${item.banRate.toFixed(0)}%` : '0%',
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
            key: 'avgGold',
            header: 'Gold',
            tooltip: 'Average Gold',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgGold,
            cell: (item) => `${(item.avgGold / 1000).toFixed(1)}k`,
            headerClassName: classname,
            cellClassName: classname + importantYellow,
        },
        {
            key: 'avgCs',
            header: 'CS',
            tooltip: 'Average Creep Score',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgCs,
            cell: (item) => item.avgCs.toFixed(0),
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
            key: 'uniquePlayers',
            header: 'Pl',
            tooltip: 'Unique Players',
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.uniquePlayers,
            headerClassName: classname,
            cellClassName: classname,
        },
    ]

    return (
        <Card className="flex flex-col w-full h-full">
            <CardContext>
                <CardBody className="p-0">
                    <div className="w-full overflow-hidden">
                        <SortableTable
                            data={data.champions}
                            columns={columns}
                            showSectionHeaders={false}
                            getRowKey={(item) => item.champion}
                            emptyState="No champion data available"
                            caption={`Champion Statistics ${data.tournament}`}
                            className="w-full text-xs table-fixed"
                        />
                    </div>
                </CardBody>
            </CardContext>
        </Card>
    )
}