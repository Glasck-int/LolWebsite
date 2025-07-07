import React from 'react'

import {
    Standings as StandingsType,
    Team,
} from '../../../../backend/src/generated/prisma'
import { Card, CardBody, CardHeader, CardHeaderBase } from '../../ui/card/Card'
import Image from 'next/image'
import { getTeamsByNames, getTeamsRecentMatches } from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'
import { Tooltip } from '@/components/utils/Tooltip'
import { ApiResponse } from '@/lib/api/utils'
import { TeamRecentMatchesResponse } from '@/lib/api/teams'
import { Form } from '@/components/utils/Form'

/**
 * StandingsOverview Component
 *
 * Displays a card showing team standings with position, games played, wins, losses, win rate, and form.
 * Can highlight a specific team and show surrounding teams in the standings.
 *
 * @param standings - Array of standings data containing team information and statistics
 * @param teamName - Optional name of a specific team to highlight and center the display around
 * @param tournamentName - Name of the tournament to filter recent matches by
 * @returns JSX element representing the standings overview card
 *
 * @example
 * ```tsx
 * const standings = [
 *   { team: 'Team A', place: 1, winGames: 10, lossGames: 2, winSeries: 5 },
 *   { team: 'Team B', place: 2, winGames: 8, lossGames: 4, winSeries: 3 }
 * ];
 *
 * <StandingsOverview
 *   standings={standings}
 *   teamName="Team A"
 *   tournamentName="LFL_2024_Spring"
 * />
 * ```
 *
 * @remarks
 * - Shows top 4 teams by default, or highlights a specific team with surrounding teams
 * - Displays team images fetched from API
 * - Responsive design with different layouts for mobile and desktop
 * - Calculates win rate percentage automatically
 * - Uses tooltips for column headers to improve user experience
 * - Shows team form based on last 5 matches in the specific tournament (W for win, L for loss)
 *
 * @see {@link getTeamsByNames} - For fetching team data
 * @see {@link getTeamImage} - For fetching team images
 * @see {@link getTeamsRecentMatches} - For fetching team recent matches and form
 */
export const StandingsOverview = async ({
    standings,
    teamName = 'Galions',
    tournamentName,
}: {
    standings: StandingsType[]
    teamName?: string
    tournamentName: string
}) => {
    const teams = standings.map((standing) => standing.team)
    const teamsData = await getTeamsByNames(
        teams.filter((team) => team !== null)
    )

    // Get recent matches for all teams in the specific tournament
    // Add error handling to prevent 404 errors from breaking the component
    let teamsRecentMatches: ApiResponse<TeamRecentMatchesResponse[]> = {
        data: undefined,
        error: undefined,
    }
    try {
        teamsRecentMatches = await getTeamsRecentMatches(
            teams.filter((team) => team !== null),
            tournamentName
        )
    } catch (error) {
        console.warn('Failed to fetch recent matches:', error)
    }

    console.log(teamsRecentMatches)
    const teamImages = await Promise.all(
        (standings || []).map(async (standing) => {
            const team = teamsData.data?.find(
                (team) => team.overviewPage === standing.team
            )
            return getTeamImage(team?.image?.replace('.png', '') || '')
        })
    )

    // Determine which standings to display
    let standingsToShow = standings
    if (teamName) {
        // Find the position of the specified team
        const teamIndex = standings.findIndex(
            (standing) => standing.team === teamName
        )
        if (teamIndex !== -1) {
            // Show the team and surrounding teams (max 4 total)
            const startIndex = Math.max(
                0,
                Math.min(teamIndex - 1, standings.length - 4)
            )
            standingsToShow = standings.slice(startIndex, startIndex + 4)
        }
    } else {
        // Show top teams (max 4)
        standingsToShow = standings.slice(0, 4)
    }

    return (
        <Card>
            <CardHeader>
                <CardHeaderBase className="px-[15px]">
                    <div className="flex items-center justify-between w-full font-semibold ">
                        <div className="w-8 text-center text-grey">
                            <Tooltip content="Position" maxWidth={200}>
                                #
                            </Tooltip>
                        </div>
                        <div className="flex items-center md:gap-4 gap-2 flex-1 justify-end">
                            <div className="w-8 text-center text-grey">
                                <Tooltip
                                    content="Nombre de matchs joués"
                                    maxWidth={200}
                                >
                                    J
                                </Tooltip>
                            </div>
                            <div className="w-8 text-center text-grey">
                                <Tooltip
                                    content="Nombre de matchs gagnés"
                                    maxWidth={200}
                                >
                                    W
                                </Tooltip>
                            </div>
                            <div className="w-8 text-center text-grey">
                                <Tooltip
                                    content="Nombre de matchs perdus"
                                    maxWidth={200}
                                >
                                    L
                                </Tooltip>
                            </div>
                            <div className="w-8 text-center text-grey">
                                <Tooltip
                                    content="Pourcentage de victoire"
                                    maxWidth={200}
                                >
                                    WR
                                </Tooltip>
                            </div>
                            <div className="w-42 text-left text-grey hidden md:block">
                                <Tooltip
                                    content="Forme d'une equipe sur les 5 derniers matchs"
                                    maxWidth={200}
                                >
                                    Form
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </CardHeaderBase>
            </CardHeader>
            <CardBody>
                <div className="flex flex-col items-center justify-between w-full">
                    {standingsToShow.map((standing, index) => {
                        // Find the original index in the full standings array
                        const originalIndex = standings.findIndex(
                            (s) => s.team === standing.team
                        )
                        const teamImageIndex =
                            originalIndex !== -1 ? originalIndex : index

                        // Check if this is the specified team
                        const isSpecifiedTeam =
                            teamName && standing.team === teamName

                        // Determine if this is the last visible row
                        const isLastVisible =
                            index === standingsToShow.length - 1

                        return (
                            <div
                                key={index}
                                className={`flex items-center justify-between w-full h-[45px] transition-colors duration-200 cursor-pointer px-[15px] ${
                                    isSpecifiedTeam
                                        ? 'bg-grey/10  hover:bg-grey/20'
                                        : 'hover:bg-grey/10'
                                } ${
                                    index < 3 ? 'block' : 'invisible md:visible'
                                } ${isLastVisible ? 'rounded-b-md' : ''}`}
                            >
                                <div className="flex items-center gap-8">
                                    <p className="w-8 text-center">
                                        {standing.place}.{' '}
                                    </p>
                                    {teamImages[teamImageIndex] && (
                                        <Image
                                            src={
                                                teamImages[teamImageIndex]
                                                    .data || ''
                                            }
                                            alt={standing.team || ''}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 object-contain"
                                            priority={index < 3}
                                        />
                                    )}
                                    <p className="hidden lg:block">
                                        {standing.team}
                                    </p>
                                    <p className="block lg:hidden">
                                        {
                                            teamsData.data?.find(
                                                (team: Team) =>
                                                    team.overviewPage ===
                                                    standing.team
                                            )?.short
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center md:gap-4 gap-2 flex-1 justify-end">
                                    <p className="w-8 text-center">
                                        {(standing.winGames || 0) +
                                            (standing.lossGames || 0)}
                                    </p>
                                    <p className="w-8 text-center">
                                        {standing.winGames}
                                    </p>
                                    <p className="w-8 text-center">
                                        {standing.lossGames}
                                    </p>
                                    <p className="w-8 text-center">
                                        {standing.winGames && standing.lossGames
                                            ? `${Math.round(
                                                  (standing.winGames /
                                                      (standing.winGames +
                                                          standing.lossGames)) *
                                                      100
                                              )}%`
                                            : '0%'}
                                    </p>
                                    <div className="w-42 text-left hidden md:block">
                                        <Form
                                            teamsRecentMatches={
                                                teamsRecentMatches.data || []
                                            }
                                            standing={standing}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardBody>
        </Card>
    )
}
