import React from 'react'
import { Card, CardBody, CardHeader, CardHeaderBase } from '../../ui/card/Card'
import { getNextThreeMatchesForLeague } from '@/lib/api/league'
import { League as LeagueType } from '../../../../backend/src/generated/prisma'
import { MatchSchedule as MatchScheduleType } from '../../../../backend/src/generated/prisma'
import { getTeamsByNames } from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'
import { TimeDisplay } from '@/lib/hooks/timeDisplay'
import { useVisibleMatches } from '@/lib/hooks/useVisibleMatches'
import { NextMatchesClient } from './NextMatchesClient'
import { SubTitle } from '@/components/ui/text/SubTitle'

/**
 * NextMatches component displays upcoming matches for a league
 * The number of matches adapts responsively to the available space
 *
 * @param league - The league object containing match data
 * @param showSingleMatchOnDesktop - Optional parameter to show only one match on desktop instead of three
 * @returns JSX element displaying the next matches
 */
export const NextMatches = async ({
    league,
    showSingleMatchOnDesktop = false,
}: {
    league: LeagueType
    showSingleMatchOnDesktop?: boolean
}) => {
    const nextMatches = await getNextThreeMatchesForLeague(Number(league.id))

    // Don't render the component if there are no matches
    if (!nextMatches.data || nextMatches.data.length === 0) {
        return null
    }

    // Extract unique team names from matches
    const teamNames = new Set<string>()
    nextMatches.data?.forEach((match) => {
        if (match.team1) teamNames.add(match.team1)
        if (match.team2) teamNames.add(match.team2)
    })

    const teamsData = await getTeamsByNames(Array.from(teamNames))

    // Get team images for all possible matches
    const teamImages = await Promise.all(
        (nextMatches.data || []).map(async (match) => {
            const team1 = teamsData.data?.find(
                (team) => team.overviewPage === match.team1
            )
            const team2 = teamsData.data?.find(
                (team) => team.overviewPage === match.team2
            )
            const team1Image = await getTeamImage(
                team1?.image?.replace('.png', '') || ''
            )
            const team2Image = await getTeamImage(
                team2?.image?.replace('.png', '') || ''
            )
            return {
                team1Image: team1Image.data,
                team2Image: team2Image.data,
            }
        })
    )

    const hover =
        'hover:opacity-70 transition-opacity duration-200 cursor-pointer'

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
                    {team1?.image && (
                        <img
                            src={images.team1Image || ''}
                            alt={team1.short || ''}
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
                    {team2?.image && (
                        <img
                            src={images.team2Image || ''}
                            alt={team2.short || ''}
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
        <Card>
            <CardHeader>
                <CardHeaderBase>
                    <div className="flex flex-row justify-between items-center w-full">
                        <SubTitle>
                            {showSingleMatchOnDesktop
                                ? 'Next Match'
                                : 'Next Matches'}
                        </SubTitle>
                        <div className="flex flex-row items-center gap-2">
                            <p>
                                {nextMatches.data?.[0]?.bestOf &&
                                    `Bo${nextMatches.data[0].bestOf}`}
                            </p>
                        </div>
                    </div>
                </CardHeaderBase>
            </CardHeader>
            <CardBody>
                <NextMatchesClient
                    matches={nextMatches.data || []}
                    teamsData={teamsData.data || []}
                    teamImages={teamImages || []}
                    showSingleMatchOnDesktop={showSingleMatchOnDesktop}
                />
            </CardBody>
        </Card>
    )
}
