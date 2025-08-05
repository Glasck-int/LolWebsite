'use client'

import React from 'react'
import { SortableTable, TableColumn } from '@/components/ui/table/SortableTable'
import { ChampionStats } from '@/lib/api/champions'
import {
    Card,
    CardContext,
    CardBody,
    CardBodyMultiple,
    CardBodyMultipleContent,
    CardHeader,
    CardHeaderColumn,
    CardHeaderTab,
    CardHeaderContent,
} from '@/components/ui/card/index'
import Image from 'next/image'
import { DDragon } from '@/lib/api/ddragon'
import { useTranslations } from 'next-intl'
import { useChampionStats } from '@/lib/swr/useChampionStats'
import { useDDragonVersions } from '@/lib/swr/useDDragonVersions'
import { TournamentChampionStatsResponse } from '@/lib/api/champions'

interface ChampionStatisticsProps {
    tournamentId: string
    initialData?: TournamentChampionStatsResponse
}

/**
 * Champion Statistics component that displays tournament champion data using SortableTable
 * Now uses advanced caching with the useChampionStatistics hook for better performance
 * and instant loading on subsequent visits.
 */
export function ChampionStatistics({ tournamentId, initialData }: ChampionStatisticsProps) {
    const t = useTranslations('ChampionStatistics')
    
    // Use SWR hooks for instant tab switching with initial data
    const {
        data,
        error,
        isLoading,
        refetch,
        isCached
    } = useChampionStats(tournamentId, initialData)
    
    // Get DDragon version separately
    const { latestVersion: ddragonVersion } = useDDragonVersions()

    // Development logging for cache performance
    if (process.env.NODE_ENV === 'development' && data) {
        console.log(`ChampionStatistics SWR Status:`, {
            tournamentId,
            isCached,
            tournament: data.tournament,
            championsCount: data.champions.length,
            ddragonVersion
        })
    }

    const classname = "text-base w-10 "
    const importantColor = "bg-clear-violet/20 "
    // const importantColor = "text-violet-300 "
    const importantYellow = "bg-yellow/20 "
    // const importantYellow = "text-yellow-300 "
    
    // Common columns for both desktop and mobile views
    const positionColumn: TableColumn<ChampionStats> = {
        key: 'position',
        header: '#',
        sortable: false,
        headerClassName: 'w-8 left-0 z-10 sticky',
        cellClassName: 'font-semibold text-base left-0 z-10 sticky',
        cell: (_, position) => <>{position}.</>,
    }
    
    const championColumn: TableColumn<ChampionStats> = {
        key: 'champion',
        header: 'Champion',
        sortable: true,
        headerClassName: 'text-left justify-start font-semibold w-32 left-8 z-10 sticky',
        cellClassName: 'font-semibold text-sm w-32 left-8 z-10 sticky',
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
    }
    
    // Column definitions for desktop view
    const desktopPositionColumn: TableColumn<ChampionStats> = {
        key: 'position',
        header: '#',
        sortable: false,
        headerClassName: 'w-8 left-0 z-10 ',
        cellClassName: 'font-semibold text-base left-0 z-10',
        cell: (_, position) => <>{position}.</>,
    }
    
    const desktopChampionColumn: TableColumn<ChampionStats> = {
        key: 'champion',
        header: 'Champion',
        sortable: true,
        headerClassName: 'text-left justify-start font-semibold w-32',
        cellClassName: 'font-semibold  text-sm w-32',
        accessor: (item) => item.champion,
        cell: championColumn.cell, // Reuse the cell renderer from mobile
    }
    
    // Define table columns for champion statistics (Desktop)
    const columns: TableColumn<ChampionStats>[] = [
        desktopPositionColumn,
        desktopChampionColumn,
        {
            key: 'gamesPlayed',
            header: 'GP',
            tooltip: t('tooltips.gamesPlayed'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.gamesPlayed || 0,
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'presenceRate',
            header: 'Pr',
            tooltip: t('tooltips.presenceRate'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.presenceRate || 0,
            cell: (item) => item.presenceRate ? `${item.presenceRate.toFixed(0)}%` : '0.0%',
            headerClassName: classname,
            cellClassName: classname ,
        },
        {
            key: 'pickRate',
            header: 'PR',
            tooltip: t('tooltips.pickRate'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.pickRate || 0,
            cell: (item) => item.pickRate ? `${item.pickRate.toFixed(0)}%` : '0.0%',
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'banRate',
            header: 'BR',
            tooltip: t('tooltips.banRate'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.banRate || 0,
            cell: (item) => item.banRate ? `${item.banRate.toFixed(0)}%` : '0.0%',
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('tooltips.winRate'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.winRate,
            cell: (item) => `${item.winRate.toFixed(0)}%`,
            headerClassName: classname,
            cellClassName: classname + importantColor ,
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: t('tooltips.wins'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.wins,
            headerClassName: classname ,
            cellClassName: classname + importantColor,
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: t('tooltips.losses'),
            sortable: true,
            accessor: (item) => item.losses,
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
                {
            key: 'kda',
            header: 'KDA',
            tooltip: t('tooltips.kda'),
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
            tooltip: t('tooltips.avgKills'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgKills,
            cell: (item) => item.avgKills.toFixed(1),
            cellClassName: classname + importantColor,
            headerClassName: classname ,
        },
        {
            key: 'avgDeaths',
            header: 'D',
            tooltip: t('tooltips.avgDeaths'),
            sortable: true,
            accessor: (item) => item.avgDeaths,
            cell: (item) => item.avgDeaths.toFixed(1),
            cellClassName: classname + importantColor,
            headerClassName: classname ,
        },
        {
            key: 'avgAssists',
            header: 'A',
            tooltip: t('tooltips.avgAssists'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgAssists,
            cell: (item) => item.avgAssists.toFixed(1),
            cellClassName: classname + importantColor,
            headerClassName: classname,
        },
        {
            key: 'avgKillParticipation',
            header: 'KP',
            tooltip: t('tooltips.avgKillParticipation'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgKillParticipation,
            cell: (item) => `${item.avgKillParticipation.toFixed(0)}%`,
            cellClassName: classname + importantColor,
            headerClassName: classname,
        },
        {
            key: 'avgGold',
            header: 'Gold',
            tooltip: t('tooltips.avgGold'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgGold,
            cell: (item) => `${(item.avgGold / 1000).toFixed(1)}k`,
            cellClassName: classname + importantYellow,
            headerClassName: classname,
        },
        {
            key: 'avgCs',
            header: 'CS',
            tooltip: t('tooltips.avgCs'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgCs,
            cell: (item) => item.avgCs.toFixed(0),
            cellClassName: classname + importantYellow ,
            headerClassName: classname,
        },
        {
            key: 'avgDamagePerMinute',
            header: 'DPM',
            tooltip: t('tooltips.avgDamagePerMinute'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgDamagePerMinute,
            cell: (item) => Math.round(item.avgDamagePerMinute).toString(),
            cellClassName: classname + importantYellow,
            headerClassName: classname ,
        },
        {
            key: 'uniquePlayers',
            header: 'Pl',
            tooltip: t('tooltips.uniquePlayers'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.uniquePlayers,
            headerClassName: classname,
            cellClassName: classname,
        },

    ]
    
    // Mobile Tab 1: Position, Champion, GP, Pr, PR, BR, Pl
    const mobileColumnsTab1: TableColumn<ChampionStats>[] = [
        positionColumn,
        championColumn,
        {
            key: 'gamesPlayed',
            header: 'GP',
            tooltip: t('tooltips.gamesPlayed'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.gamesPlayed || 0,
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'presenceRate',
            header: 'Pr',
            tooltip: t('tooltips.presenceRate'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.presenceRate || 0,
            cell: (item) => item.presenceRate ? `${item.presenceRate.toFixed(0)}%` : '0.0%',
            headerClassName: classname,
            cellClassName: classname ,
        },
        {
            key: 'pickRate',
            header: 'PR',
            tooltip: t('tooltips.pickRate'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.pickRate || 0,
            cell: (item) => item.pickRate ? `${item.pickRate.toFixed(0)}%` : '0.0%',
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'banRate',
            header: 'BR',
            tooltip: t('tooltips.banRate'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.banRate || 0,
            cell: (item) => item.banRate ? `${item.banRate.toFixed(0)}%` : '0.0%',
            headerClassName: classname,
            cellClassName: classname,
        },
        {
            key: 'uniquePlayers',
            header: 'Pl',
            tooltip: t('tooltips.uniquePlayers'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.uniquePlayers,
            headerClassName: classname,
            cellClassName: classname,
        },
    ]
    
    // Mobile Tab 2: Position, Champion, WR, W, L, KDA, KP
    const mobileColumnsTab2: TableColumn<ChampionStats>[] = [
        positionColumn,
        championColumn,
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('tooltips.winRate'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.winRate,
            cell: (item) => `${item.winRate.toFixed(0)}%`,
            headerClassName: classname,
            cellClassName: classname + importantColor ,
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: t('tooltips.wins'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.wins,
            headerClassName: classname ,
            cellClassName: classname + importantColor,
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: t('tooltips.losses'),
            sortable: true,
            accessor: (item) => item.losses,
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'kda',
            header: 'KDA',
            tooltip: t('tooltips.kda'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.kda,
            cell: (item) => item.kda.toFixed(2),
            headerClassName: classname,
            cellClassName: classname + importantColor,
        },
        {
            key: 'avgKillParticipation',
            header: 'KP',
            tooltip: t('tooltips.avgKillParticipation'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgKillParticipation,
            cell: (item) => `${item.avgKillParticipation.toFixed(0)}%`,
            cellClassName: classname + importantColor,
            headerClassName: classname,
        },
    ]
    
    // Mobile Tab 3: Position, Champion, Gold, CS, DPM
    const mobileColumnsTab3: TableColumn<ChampionStats>[] = [
        positionColumn,
        championColumn,
        {
            key: 'avgGold',
            header: 'Gold',
            tooltip: t('tooltips.avgGold'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgGold,
            cell: (item) => `${(item.avgGold / 1000).toFixed(1)}k`,
            cellClassName: classname + importantYellow,
            headerClassName: classname,
        },
        {
            key: 'avgCs',
            header: 'CS',
            tooltip: t('tooltips.avgCs'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgCs,
            cell: (item) => item.avgCs.toFixed(0),
            cellClassName: classname + importantYellow ,
            headerClassName: classname,
        },
        {
            key: 'avgDamagePerMinute',
            header: 'DPM',
            tooltip: t('tooltips.avgDamagePerMinute'),
            sortable: true,
            defaultSortDirection: 'desc',
            accessor: (item) => item.avgDamagePerMinute,
            cell: (item) => Math.round(item.avgDamagePerMinute).toString(),
            cellClassName: classname + importantYellow,
            headerClassName: classname ,
        },
    ]

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-2">
                <div className="text-muted-foreground">{t('loading')}</div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-muted-foreground">
                        Fetching tournament: {tournamentId}
                    </div>
                )}
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="text-red-500 text-center">
                    <div className="font-medium">{t('error')}</div>
                    <div className="text-sm mt-1">{error}</div>
                </div>
                <button
                    onClick={refetch}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (!data || !data.champions.length) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">{t('noData')}</div>
            </div>
        )
    }

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:block w-full h-full">
                <Card className="flex flex-col w-full h-full">
                    <CardContext>
                        <CardBody className="p-0">
                            <div className="w-full overflow-hidden">
                                <SortableTable
                                    data={data.champions}
                                    columns={columns}
                                    showSectionHeaders={false}
                                    getRowKey={(item) => item.champion}
                                    emptyState={t('emptyState')}
                                    caption={`${t('title')} ${data.tournament}`}
                                    className="w-full text-xs table-fixed"
                                />
                            </div>
                        </CardBody>
                    </CardContext>
                </Card>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden w-full h-full">
                <Card className="flex flex-col w-full h-full">
                    <CardContext>
                        <CardHeader>
                            <CardHeaderColumn>
                                <CardHeaderTab>
                                    <CardHeaderContent>
                                        <p className="text-inherit text-sm font-medium">General</p>
                                    </CardHeaderContent>
                                    <CardHeaderContent>
                                        <p className="text-inherit text-sm font-medium">Combat</p>
                                    </CardHeaderContent>
                                    <CardHeaderContent>
                                        <p className="text-inherit text-sm font-medium">Economy</p>
                                    </CardHeaderContent>
                                </CardHeaderTab>
                            </CardHeaderColumn>
                        </CardHeader>
                        <CardBodyMultiple>
                            <CardBodyMultipleContent className="p-0">
                                <div className="w-full overflow-x-auto">
                                    <SortableTable
                                        data={data.champions}
                                        columns={mobileColumnsTab1}
                                        showSectionHeaders={false}
                                        getRowKey={(item) => item.champion}
                                        emptyState={t('emptyState')}
                                        caption={`${t('title')} ${data.tournament} - General`}
                                        className="w-full text-xs"
                                    />
                                </div>
                            </CardBodyMultipleContent>
                            <CardBodyMultipleContent className="p-0">
                                <div className="w-full overflow-x-auto">
                                    <SortableTable
                                        data={data.champions}
                                        columns={mobileColumnsTab2}
                                        showSectionHeaders={false}
                                        getRowKey={(item) => item.champion}
                                        emptyState={t('emptyState')}
                                        caption={`${t('title')} ${data.tournament} - Combat`}
                                        className="w-full text-xs"
                                    />
                                </div>
                            </CardBodyMultipleContent>
                            <CardBodyMultipleContent className="p-0">
                                <div className="w-full overflow-x-auto">
                                    <SortableTable
                                        data={data.champions}
                                        columns={mobileColumnsTab3}
                                        showSectionHeaders={false}
                                        getRowKey={(item) => item.champion}
                                        emptyState={t('emptyState')}
                                        caption={`${t('title')} ${data.tournament} - Economy`}
                                        className="w-full text-xs"
                                    />
                                </div>
                            </CardBodyMultipleContent>
                        </CardBodyMultiple>
                    </CardContext>
                </Card>
            </div>
        </>
    )
}