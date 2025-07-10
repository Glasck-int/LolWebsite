'use client'

import React from 'react'
import { StandingsRow } from '../StandingsRow'
import { StandingsHeader } from '../StandingsHeader'
import { StandingsRows } from '../StandingsRows'
import { Column } from '../types'
import { Form } from '@/components/utils/Form'
import {
    Card,
    CardBody,
    CardBodyMultiple,
    CardHeader,
    CardHeaderTab,
    CardHeaderContent,
    CardBodyMultipleContent,
    CardSort,
    CardHeaderBase,
    CardHeaderSortContent,
} from '@/components/ui/card/index'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { ProcessedStanding } from '../StandingsDataProcessor'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { SortedRows } from '../Sort/SortedRows'

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
            headerClassName: 'text-center cursor-pointer flex-shrink-0',
            className: 'text-center cursor-pointer flex-shrink-0',
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
        },
        {
            key: 'played',
            header: 'J',
            tooltip: t('MatchesPlayedTooltip'),
            cell: ({ totalGames }) => <p>{totalGames}</p>,
            headerClassName: 'text-center flex-shrink-0',
            className: 'text-center flex-shrink-0',
        },
        {
            key: 'wins',
            header: 'W',
            tooltip: t('WinsTooltip'),
            cell: ({ standing }) => <p>{standing.winGames}</p>,
            headerClassName: 'text-center flex-shrink-0',
            className: 'text-center flex-shrink-0',
        },
        {
            key: 'losses',
            header: 'L',
            tooltip: t('LossesTooltip'),
            cell: ({ standing }) => <p>{standing.lossGames}</p>,
            headerClassName: 'text-center flex-shrink-0',
            className: 'text-center flex-shrink-0',
        },
        {
            key: 'winRate',
            header: 'WR',
            tooltip: t('WRTooltip'),
            cell: ({ winRate }) => <p>{winRate}%</p>,
            headerClassName: 'text-center flex-shrink-0',
            className: 'text-center flex-shrink-0',
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
            headerClassName: 'text-left hidden md:flex flex-shrink-0 w-42',
            className: 'text-left hidden md:flex flex-shrink-0 w-42',
        },
    ]

    const gridTemplate = '32px 1fr 40px 40px 40px 50px 180px'

    return (
        <Card className="flex flex-col w-full h-full">
            <CardSort>
                {/* First header: Tabs */}
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
                        {/* Tab 1: BO/SERIE - Standings with sortable headers */}
                        <CardBodyMultipleContent>
                            <div className="flex flex-col w-full h-full">
                                {/* Sortable header for BO/SERIE tab */}
                                <CardHeader>
                                    <CardHeaderBase>
                                        <div
                                            className="hidden md:grid w-full items-center"
                                            style={{
                                                gridTemplateColumns:
                                                    gridTemplate,
                                            }}
                                        >
                                            {columns.map((col) => (
                                                <CardHeaderSortContent
                                                    key={col.key}
                                                    sortName={col.key}
                                                    className={`text-center ${
                                                        col.headerClassName ??
                                                        ''
                                                    }`}
                                                >
                                                    <SubTitle
                                                        children={
                                                            col.header as string
                                                        }
                                                        tooltip={col.tooltip}
                                                        className="cursor-pointer text-inherit"
                                                    />
                                                </CardHeaderSortContent>
                                            ))}
                                        </div>
                                        {/* Mobile version */}
                                        <div className="md:hidden w-full">
                                            <StandingsHeader
                                                columns={columns}
                                                isMobile={true}
                                            />
                                        </div>
                                    </CardHeaderBase>
                                </CardHeader>

                                {/* Mobile header
                            <div className="md:hidden">
                                <StandingsHeader
                                columns={columns}
                                isMobile={true}
                                />
                                </div> */}
                                {/* Desktop header
                            <div className="hidden md:block">
                            <StandingsHeader
                            columns={columns}
                            isMobile={false}
                                />
                                </div> */}


                                
                                <StandingsRows
                                    processedData={processedData}
                                    columns={columns}
                                    highlightedTeam={highlightedTeam}
                                    maxRows={maxRows}
                                    gridTemplate={gridTemplate}
                                />
                            </div>
                        </CardBodyMultipleContent>

                        {/* Tab 2: GAMES - Content without sortable headers */}
                        <CardBodyMultipleContent>
                            <div className="flex flex-col w-full h-full">
                                {/* Content for GAMES tab - no sortable headers here */}
                                <div className="p-4">
                                    <p>Games content will go here</p>
                                </div>
                            </div>
                        </CardBodyMultipleContent>

                        {/* Future tabs can be added here */}
                    </CardBodyMultiple>
                </CardBody>
            </CardSort>
        </Card>
    )
}
