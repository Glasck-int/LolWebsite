import React from 'react'
import {
    Card,
    CardBody,
    CardHeader,
    CardHeaderBase,
} from '@/components/ui/card/index'
import { MatchSchedule } from '../../../../backend/src/generated/prisma'
import { getTeamsByNames } from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'
import { NextMatchesClient } from './NextMatchesClient'
import {
    getLastThreeMatchesForTournament,
    getNextThreeMatchesForTournament,
} from '@/lib/api/tournaments'

interface NextMatchesProps {
    showSingleMatchOnDesktop?: boolean
    lastMatches?: boolean
    tournamentId?: string
}

/**
 * NextMatches component displays upcoming matches for a league
 * The number of matches adapts responsively to the available space
 *
 * @param league - The league object containing match data
 * @param showSingleMatchOnDesktop - Optional parameter to show only one match on desktop instead of three
 * @param lastMatches - Optional parameter to show last matches instead of next matches
 * @param tournamentId - Optional tournament ID for fetching last matches
 * @returns JSX element displaying the next matches or null if no matches are available
 *
 * @example
 * ```tsx
 * <NextMatches league={leagueData} showSingleMatchOnDesktop={true} />
 * ```
 *
 * @remarks
 * This component fetches the next three matches for a league and displays them in a card format.
 * The actual rendering is delegated to the NextMatchesClient component.
 */
export const NextMatches = async ({
    showSingleMatchOnDesktop = false,
    lastMatches = false,
    tournamentId,
}: NextMatchesProps) => {
    let matches: MatchSchedule[] = []

    // Fallback to last matches if no next matches are found
    try {
        const nextMatchesResponse = await getNextThreeMatchesForTournament(
            tournamentId || ''
        )
        if (nextMatchesResponse.data && nextMatchesResponse.data.length > 0) {
            matches = nextMatchesResponse.data
        } else {
            const lastMatchesResponse = await getLastThreeMatchesForTournament(
                tournamentId || ''
            )
            matches = lastMatchesResponse.data || []
            lastMatches = true
        }
    } catch (error) {
        console.error('Error fetching matches:', error)
        return null
    }

    if (!matches || matches.length === 0) {
        return null
    }

    const teamNames = new Set<string>()
    matches?.forEach((match) => {
        if (match.team1) teamNames.add(match.team1)
        if (match.team2) teamNames.add(match.team2)
    })

    const teamsData = await getTeamsByNames(Array.from(teamNames))

    // Get team images for all possible matches
    const teamImages = await Promise.all(
        (matches || []).map(async (match) => {
            const team1 = teamsData.data?.find(
                (team) => team.overviewPage === match.team1
            )
            const team2 = teamsData.data?.find(
                (team) => team.overviewPage === match.team2
            )
            const team1Image = await getTeamImage(
                team1?.image?.replace('.png', '.webp') || ''
            )
            const team2Image = await getTeamImage(
                team2?.image?.replace('.png', '.webp') || ''
            )
            return {
                team1Image: team1Image.data,
                team2Image: team2Image.data,
            }
        })
    )

    return (
        <Card>
            <CardHeader>
                <CardHeaderBase>
                    <div className="flex flex-row justify-between items-center w-full">
                        <NextMatchesClient
                            matches={matches || []}
                            teamsData={teamsData?.data || []}
                            teamImages={teamImages || []}
                            showSingleMatchOnDesktop={showSingleMatchOnDesktop}
                            lastMatches={lastMatches}
                            isHeader={true}
                            bestOf={matches?.[0]?.bestOf}
                        />
                    </div>
                </CardHeaderBase>
            </CardHeader>
            <CardBody>
                <NextMatchesClient
                    matches={matches || []}
                    teamsData={teamsData?.data || []}
                    teamImages={teamImages || []}
                    showSingleMatchOnDesktop={showSingleMatchOnDesktop}
                    lastMatches={lastMatches}
                    isHeader={false}
                />
            </CardBody>
        </Card>
    )
}
