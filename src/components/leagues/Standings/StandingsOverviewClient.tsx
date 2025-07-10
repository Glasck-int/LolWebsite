'use client'

import React from 'react'
import { StandingsRow } from './StandingsRow'
import { StandingsHeader } from './StandingsHeader'
import { Column } from './types'
import Image from 'next/image'
import { Form } from '@/components/utils/Form'
import { Card, CardBody, CardHeader } from '@/components/ui/card/index'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { ProcessedStanding } from './StandingsDataProcessor'

/**
 * Client-side standings overview component.
 *
 * Handles the rendering of standings data with translations and client-side interactions.
 * This component is responsible for the UI rendering while the parent handles data fetching.
 *
 * @param processedData - Processed standings data with team information and statistics
 * @param highlightedTeam - Optional team name to highlight in the standings
 * @param maxRows - Optional maximum number of rows to display (null for all rows)
 * @returns A complete standings table component with team data and statistics
 *
 * @example
 * ```tsx
 * <StandingsOverviewClient
 *   processedData={processedData}
 *   highlightedTeam="Team Liquid"
 *   maxRows={5}
 * />
 * ```
 */
export const StandingsOverviewClient = ({
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
                        <Image
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
        <Card>
            {/* Mobile header */}
            <CardHeader>
                <div className="md:hidden w-full">
                    <StandingsHeader columns={columns} isMobile={true} />
                </div>
                {/* Desktop header */}
                <div className="hidden md:block w-full">
                    <StandingsHeader columns={columns} isMobile={false} />
                </div>
            </CardHeader>
            <CardBody className="flex flex-col">
                {processedData.map((item, index) => {
                    // Default behavior: 3 rows on mobile, 4 rows on desktop
                    const mobileMaxRows = maxRows ?? 3
                    const desktopMaxRows = maxRows ?? 4

                    // Find highlighted team index
                    const highlightedIndex = highlightedTeam
                        ? processedData.findIndex(
                              (data) => data.standing.team === highlightedTeam
                          )
                        : -1

                    // Calculate which rows to show based on highlighted team
                    let shouldShowOnMobile = false
                    let shouldShowOnDesktop = false

                    if (highlightedIndex !== -1) {
                        // Center around highlighted team
                        const mobileHalf = Math.floor(mobileMaxRows / 2)
                        const desktopHalf = Math.floor(desktopMaxRows / 2)

                        const mobileStart = Math.max(
                            0,
                            highlightedIndex - mobileHalf
                        )
                        const mobileEnd = mobileStart + mobileMaxRows
                        const desktopStart = Math.max(
                            0,
                            highlightedIndex - desktopHalf
                        )
                        const desktopEnd = desktopStart + desktopMaxRows

                        shouldShowOnMobile =
                            index >= mobileStart && index < mobileEnd
                        shouldShowOnDesktop =
                            index >= desktopStart && index < desktopEnd
                    } else {
                        // No highlighted team, show top rows
                        shouldShowOnMobile =
                            maxRows === null || index < mobileMaxRows
                        shouldShowOnDesktop =
                            maxRows === null || index < desktopMaxRows
                    }

                    // Determine CSS classes based on visibility
                    let className = ''
                    if (shouldShowOnMobile && shouldShowOnDesktop) {
                        className = 'flex' // Show on both mobile and desktop
                    } else if (shouldShowOnMobile && !shouldShowOnDesktop) {
                        className = 'flex md:hidden' // Show only on mobile
                    } else if (!shouldShowOnMobile && shouldShowOnDesktop) {
                        className = 'hidden md:flex' // Show only on desktop
                    } else {
                        className = 'hidden' // Hide on both
                    }

                    return (
                        <div key={item.standing.team} className={className}>
                            <StandingsRow
                                item={item}
                                columns={columns}
                                isHighlighted={
                                    item.standing.team === highlightedTeam
                                }
                            />
                        </div>
                    )
                })}
            </CardBody>
        </Card>
    )
}
