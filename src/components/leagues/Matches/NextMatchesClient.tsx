'use client'

import React from 'react'
import { MatchSchedule as MatchScheduleType } from '../../../../backend/src/generated/prisma'
import { TimeDisplay } from '@/lib/hooks/timeDisplay'
import { useVisibleMatches } from '@/lib/hooks/useVisibleMatches'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { SubTitle } from '@/components/ui/text/SubTitle'

interface NextMatchesClientProps {
    matches: MatchScheduleType[]
    teamsData: Array<{
        short?: string | null
        image?: string | null
        overviewPage?: string | null
    }>
    teamImages: Array<{
        team1Image?: string | null
        team2Image?: string | null
    }>
    showSingleMatchOnDesktop: boolean
    lastMatches: boolean
    isHeader?: boolean
    bestOf?: number | null
}

/**
 * Client component that handles the responsive display of matches
 */
export const NextMatchesClient = ({
    matches,
    teamsData,
    teamImages,
    showSingleMatchOnDesktop,
    lastMatches,
    isHeader = false,
    bestOf,
}: NextMatchesClientProps) => {
    const t = useTranslations('Tournaments')
    const { containerRef, testRef, visibleCount } = useVisibleMatches(
        matches.length,
        showSingleMatchOnDesktop
    )

    const matchesToShow = matches.slice(0, visibleCount)

    const hover =
        'hover:opacity-70 transition-opacity duration-200 cursor-pointer'

    // If this is the header component, render the title
    if (isHeader) {
        return (
            <div className="flex flex-row justify-between items-center w-full">
                <SubTitle>
                    {lastMatches ? t('lastMatch') : t('nextMatch')}
                </SubTitle>
                <SubTitle>{bestOf ? `Bo${bestOf}` : ''}</SubTitle>
            </div>
        )
    }

    /**
     * Renders a single match with consistent styling
     */
    const renderMatch = (
        match: MatchScheduleType,
        team1: { short?: string | null; image?: string | null } | undefined,
        team2: { short?: string | null; image?: string | null } | undefined,
        images: { team1Image?: string | null; team2Image?: string | null },
        index: number,
        totalMatches: number
    ) => {
        const isMiddleMatch = totalMatches > 1 && index === 1

        // Determine border classes based on position
        let borderClasses = ''
        if (totalMatches > 1) {
            if (totalMatches === 2) {
                // Two matches: border only on second match
                borderClasses =
                    index === 1
                        ? 'border-l border-l-neutral-600 border-t-0 border-b-0'
                        : ''
            } else if (totalMatches === 3) {
                // Three matches: border only on middle match
                borderClasses = isMiddleMatch
                    ? 'border-l border-r border-l-neutral-600 border-r-neutral-600 border-t-0 border-b-0'
                    : ''
            }
        }

        return (
            <div
                key={match.id}
                className={`flex flex-row items-center justify-center bg-transparent px-4 py-2 h-[125px] flex-1 rounded-none transition-colors duration-200 ${borderClasses} ${hover}`}
            >
                {/* Team 1 */}
                <div className="flex flex-col items-center w-16">
                    {team1?.image &&
                        images.team1Image &&
                        images.team1Image.trim() !== '' &&
                        images.team1Image !== 'null' && (
                            <Image
                                src={images.team1Image}
                                alt={team1.short || 'Team 1'}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-contain mb-2"
                            />
                        )}
                    <span className="font-bold text-white text-xl">
                        {team1?.short || match.team1}
                    </span>
                </div>

                {/* Match info */}
                <div className="flex flex-col items-center flex-1">
                    <TimeDisplay dateTime_UTC={match.dateTime_UTC || null} />
                </div>

                {/* Team 2 */}
                <div className="flex flex-col items-center w-16">
                    {team2?.image &&
                        images.team2Image &&
                        images.team2Image.trim() !== '' &&
                        images.team2Image !== 'null' && (
                            <Image
                                src={images.team2Image}
                                alt={team2.short || 'Team 2'}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-contain mb-2"
                            />
                        )}
                    <span className="font-bold text-white text-xl">
                        {team2?.short || match.team2}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="w-full">
            {/* Hidden test element to measure match width */}
            <div
                ref={testRef}
                className="absolute invisible"
                style={{ width: '280px' }}
            />

            {/* Visible matches container */}
            <div className="flex flex-row w-full">
                {matchesToShow.map((match, idx) => {
                    const team1 = teamsData.find(
                        (team) => team.overviewPage === match.team1
                    )
                    const team2 = teamsData.find(
                        (team) => team.overviewPage === match.team2
                    )
                    return renderMatch(
                        match,
                        team1,
                        team2,
                        teamImages[idx] || { team1Image: null, team2Image: null },
                        idx,
                        matchesToShow.length
                    )
                })}
            </div>
        </div>
    )
}
