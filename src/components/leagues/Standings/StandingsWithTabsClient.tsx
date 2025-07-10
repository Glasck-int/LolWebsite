'use client'

import React from 'react'
import { StandingsRow } from './StandingsRow'
import { StandingsHeader } from './StandingsHeader'
import { StandingsRows } from './StandingsRows'
import { Column } from './types'
import { Form } from '@/components/utils/Form'
import {
    Card,
    CardBody,
    CardBodyMultiple,
    CardHeader,
    CardHeaderTab,
    CardHeaderContent,
    CardBodyMultipleContent,
} from '@/components/ui/card/index'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { ProcessedStanding } from './StandingsDataProcessor'

/**
 * Client-side standings component with tabs using CardBodyMultiple.
 *
 * Handles the rendering of standings data with tabs structure. The first tab
 * contains the complete standings table, while additional tabs can be added
 * for future features. Uses CardBodyMultiple for tab switching functionality.
 *
 * @param processedData - Processed standings data with team information and statistics
 * @param highlightedTeam - Optional team name to highlight in the standings
 * @param maxRows - Optional maximum number of rows to display (null for all rows)
 * @returns A standings component with tabs structure and complete standings in first tab
 *
 * @example
 * ```tsx
 * <StandingsWithTabsClient
 *   processedData={processedData}
 *   highlightedTeam="Team Liquid"
 *   maxRows={5}
 * />
 * ```
 */
export const StandingsWithTabsClient = ({
    processedData,
    highlightedTeam,
    maxRows,
}: {
    processedData: ProcessedStanding[]
    highlightedTeam?: string
    maxRows?: number | null
}) => {
    const t = useTranslate('Standings')

    const teamHover = 'hover:text-clear-violet/80 transition-all duration-200'

    const columns: Column<ProcessedStanding>[] = [
        {
            key: 'place',
            header: '#',
            cell: ({ standing }) => <p>{standing.place}.</p>,
            tooltip: t('#'),
            headerClassName: 'w-8 text-center',
            className: 'w-8 text-center',
        },
        {
            key: 'team',
            header: t('Team'),
            cell: ({ standing, teamImage, teamData }) => (
                <div className="flex items-center gap-3">
                    {teamImage ? (
                        <img
                            src={teamImage}
                            alt={standing.team || ''}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                        />
                    ) : (
                        <div className="w-8 h-8" />
                    )}
                    <p
                        className={`hidden lg:block justify-start items-center ${teamHover}`}
                    >
                        {standing.team}
                    </p>
                    <p className={`block lg:hidden ${teamHover}`}>
                        {teamData?.short}
                    </p>
                </div>
            ),
            headerClassName: 'justify-start items-center',
        },
        {
            key: 'played',
            header: 'J',
            tooltip: t('MatchesPlayedTooltip'),
            cell: ({ totalGames }) => <p>{totalGames}</p>,
            headerClassName: 'w-8 text-center',
            className: 'w-8 text-center',
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            cell: ({ standing }) => <p>{standing.winGames}</p>,
            headerClassName: 'w-8 text-center',
            className: 'w-8 text-center',
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            cell: ({ standing }) => <p>{standing.lossGames}</p>,
            headerClassName: 'w-8 text-center',
            className: 'w-8 text-center',
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            cell: ({ winRate }) => <p>{winRate}%</p>,
            headerClassName: 'w-8 text-center',
            className: 'w-8 text-center',
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
            headerClassName: 'w-42 text-left hidden md:flex',
            className: 'w-42 text-left hidden md:flex',
        },
    ]

    return (
        <Card className="flex flex-col w-full h-full">
            <CardHeader>
                <CardHeaderTab>
                    <CardHeaderContent>
                        <p className="text-inherit">BO/SERIE</p>
                    </CardHeaderContent>
                    <CardHeaderContent>
                        <p className="text-inherit">GAMES</p>
                    </CardHeaderContent>
                    {/* Future tabs can be added here */}
                </CardHeaderTab>
            </CardHeader>
            <CardBody>
                <CardBodyMultiple>
                    <CardBodyMultipleContent>
                        {/* Tab 1: Standings */}
                        <div className="flex flex-col w-full h-full">
                            {/* Mobile header */}
                            <div className="md:hidden">
                                <StandingsHeader
                                    columns={columns}
                                    isMobile={true}
                                />
                            </div>
                            {/* Desktop header */}
                            <div className="hidden md:block">
                                <StandingsHeader
                                    columns={columns}
                                    isMobile={false}
                                />
                            </div>
                            <StandingsRows
                                processedData={processedData}
                                columns={columns}
                                highlightedTeam={highlightedTeam}
                                maxRows={maxRows}
                            />
                        </div>
                    </CardBodyMultipleContent>

                    {/* Future tabs can be added here */}
                </CardBodyMultiple>
            </CardBody>
        </Card>
    )
}
