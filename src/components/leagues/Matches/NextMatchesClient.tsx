'use client'

import React from 'react'
import { MatchSchedule as MatchScheduleType } from '@/generated/prisma'
import { TimeDisplay } from '@/lib/hooks/timeDisplay'
import { useVisibleMatches } from '@/lib/hooks/useVisibleMatches'
import { useMatchesData } from '@/hooks/useMatchesData'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { SubTitle } from '@/components/ui/text/SubTitle'
import {
    Card,
    CardBody,
    CardHeader,
    CardHeaderBase,
} from '@/components/ui/card/index'

interface NextMatchesData {
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
    lastMatches: boolean
}

interface NextMatchesClientProps {
    initialData?: NextMatchesData
    tournamentId?: number
    showSingleMatchOnDesktop: boolean
    isHeader?: boolean
    bestOf?: number | null
    // Legacy props for backward compatibility
    matches?: MatchScheduleType[]
    teamsData?: Array<{
        short?: string | null
        image?: string | null
        overviewPage?: string | null
    }>
    teamImages?: Array<{
        team1Image?: string | null
        team2Image?: string | null
    }>
    lastMatches?: boolean
}

/**
 * Client component that handles the responsive display of matches
 * Can work with initialData (from server) or legacy direct props
 * Falls back to client-side fetching if no data provided
 */
export const NextMatchesClient = ({
    initialData,
    tournamentId,
    showSingleMatchOnDesktop,
    isHeader = false,
    // bestOf,
    // Legacy props
    matches: legacyMatches,
    teamsData: legacyTeamsData,
    teamImages: legacyTeamImages,
    lastMatches: legacyLastMatches,
}: NextMatchesClientProps) => {
    const t = useTranslations('Tournaments')
    
    // Use the new cached hook for matches data
    const { data: cachedData, loading, error } = useMatchesData(tournamentId)
    
    // Determine which data to use - prioritize cached data, then initialData, then legacy props
    const currentData = cachedData || initialData || {
        matches: legacyMatches || [],
        teamsData: legacyTeamsData || [],
        teamImages: legacyTeamImages || [],
        lastMatches: legacyLastMatches || false
    }
    
    const { containerRef, testRef, visibleCount } = useVisibleMatches(
        currentData.matches.length,
        showSingleMatchOnDesktop
    )
    
    // Note: Client-side fetching is now handled by useMatchesData hook

    const matchesToShow = currentData.matches.slice(0, visibleCount)
    
    // Show loading state only when actually loading and no data available
    if (loading && !currentData.matches.length) {
        return (
            <div className="flex items-center justify-center h-[125px]">
                <div className="text-gray-400">Loading matches...</div>
            </div>
        )
    }

    // Show error state if there's an error and no data
    if (error && !currentData.matches.length) {
        return (
            <div className="flex items-center justify-center h-[125px]">
                <div className="text-red-400">Error loading matches: {error}</div>
            </div>
        )
    }

    // Show "no matches" state if no loading, no error, but no matches
    if (!loading && !error && !currentData.matches.length) {
        return (
            <div className="flex items-center justify-center h-[125px]">
                <div className="text-gray-400">Aucun match disponible</div>
            </div>
        )
    }

    const hover =
        'hover:opacity-70 transition-opacity duration-200 cursor-pointer'

    // If this is the header component, render the title
    if (isHeader) {
        return (
            <div className="flex flex-row justify-between items-center w-full">
                <SubTitle>
                    {currentData.lastMatches === true ? t('lastMatch') : t('nextMatch')}
                </SubTitle>
                {/* <SubTitle>{bestOf ? `Bo${bestOf}` : ''}</SubTitle> */}
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
                    {currentData.lastMatches === true ? (
                        // Afficher le score pour les derniers matches
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-lg">
                                {match.team1Score || 0} - {match.team2Score || 0}
                            </span>
                            <span className="text-gray-400 text-sm">
                                {match.dateTime_UTC ? new Date(match.dateTime_UTC).toLocaleDateString() : ''}
                            </span>
                        </div>
                    ) : (
                        // Afficher l'heure pour les prochains matches
                        <TimeDisplay dateTime_UTC={match.dateTime_UTC || null} />
                    )}
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

    // If we need to show a full card (not just header/body content)
    if (!isHeader && !initialData && currentData.matches.length > 0) {
        return (
            <Card>
                <CardHeader>
                    <CardHeaderBase>
                        <div className="flex flex-row justify-between items-center w-full">
                            <SubTitle>
                                {currentData.lastMatches === true ? t('lastMatch') : t('nextMatch')}
                            </SubTitle>
                        </div>
                    </CardHeaderBase>
                </CardHeader>
                <CardBody>
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
                                const team1 = currentData.teamsData.find(
                                    (team) => team.overviewPage === match.team1
                                )
                                const team2 = currentData.teamsData.find(
                                    (team) => team.overviewPage === match.team2
                                )
                                return renderMatch(
                                    match,
                                    team1,
                                    team2,
                                    currentData.teamImages[idx] || { team1Image: null, team2Image: null },
                                    idx,
                                    matchesToShow.length
                                )
                            })}
                        </div>
                    </div>
                </CardBody>
            </Card>
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
                    const team1 = currentData.teamsData.find(
                        (team) => team.overviewPage === match.team1
                    )
                    const team2 = currentData.teamsData.find(
                        (team) => team.overviewPage === match.team2
                    )
                    return renderMatch(
                        match,
                        team1,
                        team2,
                        currentData.teamImages[idx] || { team1Image: null, team2Image: null },
                        idx,
                        matchesToShow.length
                    )
                })}
            </div>
        </div>
    )
}
