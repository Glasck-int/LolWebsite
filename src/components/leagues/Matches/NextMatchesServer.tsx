import React from 'react'
import {
    Card,
    CardBody,
    CardHeader,
    CardHeaderBase,
} from '@/components/ui/card/index'
import { MatchSchedule } from '@/generated/prisma'
import { getTeamsByNames } from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'
import { NextMatchesClient } from './NextMatchesClient'
import {
    getMatchesForTournament,
} from '@/lib/api/tournaments'

interface NextMatchesServerProps {
    showSingleMatchOnDesktop?: boolean
    tournamentId?: number
}

interface NextMatchesData {
    matches: MatchSchedule[]
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

/**
 * Server Component that fetches matches data and passes it to client component
 * Eliminates loading state for cached data
 */
export const NextMatchesServer = async ({
    showSingleMatchOnDesktop = false,
    tournamentId,
}: NextMatchesServerProps) => {
    if (!tournamentId) {
        return null
    }

    let matchesData: NextMatchesData = {
        matches: [],
        teamsData: [],
        teamImages: [],
        lastMatches: false
    }

    try {
        // Fetch matches using the combined endpoint
        const matchesResponse = await getMatchesForTournament(tournamentId.toString())

        if (matchesResponse.error || !matchesResponse.data) {
            console.error('Error fetching matches:', matchesResponse.error)
            return null
        }

        const matches = matchesResponse.data.data || []
        const isLastMatches = matchesResponse.data.type === 'last'

        if (matches.length === 0) {
            return null
        }

        // Get unique team names
        const teamNames = new Set<string>()
        matches.forEach((match) => {
            if (match.team1) teamNames.add(match.team1)
            if (match.team2) teamNames.add(match.team2)
        })

        // Fetch teams data
        const teamsResponse = await getTeamsByNames(Array.from(teamNames))
        const teams = teamsResponse.data || []

        // Fetch team images for all matches
        const teamImages = await Promise.all(
            matches.map(async (match) => {
                const team1 = teams.find(
                    (team) => team.overviewPage === match.team1
                )
                const team2 = teams.find(
                    (team) => team.overviewPage === match.team2
                )

                const [team1ImageResponse, team2ImageResponse] = await Promise.all([
                    getTeamImage(team1?.image?.replace('.png', '.webp') || ''),
                    getTeamImage(team2?.image?.replace('.png', '.webp') || '')
                ])

                return {
                    team1Image: team1ImageResponse.data,
                    team2Image: team2ImageResponse.data,
                }
            })
        )

        matchesData = {
            matches,
            teamsData: teams,
            teamImages,
            lastMatches: isLastMatches
        }

    } catch (error) {
        console.error('Error fetching matches:', error)
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardHeaderBase>
                    <div className="flex flex-row justify-between items-center w-full">
                        <NextMatchesClient
                            initialData={matchesData}
                            tournamentId={tournamentId}
                            showSingleMatchOnDesktop={showSingleMatchOnDesktop}
                            isHeader={true}
                            bestOf={matchesData.matches[0]?.bestOf}
                        />
                    </div>
                </CardHeaderBase>
            </CardHeader>
            <CardBody>
                <NextMatchesClient
                    initialData={matchesData}
                    tournamentId={tournamentId}
                    showSingleMatchOnDesktop={showSingleMatchOnDesktop}
                    isHeader={false}
                />
            </CardBody>
        </Card>
    )
}