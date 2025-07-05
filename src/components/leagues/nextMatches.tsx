import React from 'react'
import { Card, CardBody, CardHeader, CardOneHeader } from '../ui/card/Card'
import { getNextThreeMatchesForLeague } from '@/lib/api/league'
import { League as LeagueType } from '../../../backend/src/generated/prisma'
import { getTeamsByNames } from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'

export const NextMatches = async ({ league }: { league: LeagueType }) => {
    const nextMatches = await getNextThreeMatchesForLeague(Number(league.id))

    // Extract unique team names from matches
    const teamNames = new Set<string>()
    nextMatches.data?.forEach((match) => {
        if (match.team1) teamNames.add(match.team1)
        if (match.team2) teamNames.add(match.team2)
    })

    const teamsData = await getTeamsByNames(Array.from(teamNames))

    // Get team images
    const team1Image = await getTeamImage(
        teamsData.data
            ?.find((team) => team.overviewPage === nextMatches.data?.[0]?.team1)
            ?.image?.replace('.png', '') || ''
    )

    const team2Image = await getTeamImage(
        teamsData.data
            ?.find((team) => team.overviewPage === nextMatches.data?.[0]?.team2)
            ?.image?.replace('.png', '') || ''
    )

    return (
        <Card>
            <CardHeader>
                <CardOneHeader>
                    <div className="flex flex-row justify-between items-center w-full">
                        <p className="text-clear-grey font-semibold md:hidden block">
                            Next Match
                        </p>
                        <p className="text-clear-grey font-semibold hidden md:block">
                            Next Matches
                        </p>
                        <div className="flex flex-row items-center gap-2">
                            <p>
                                {nextMatches.data?.[0]?.bestOf &&
                                    `Best of ${nextMatches.data[0].bestOf}`}
                            </p>
                        </div>
                    </div>
                </CardOneHeader>
            </CardHeader>
            <CardBody>
                {nextMatches.data &&
                    nextMatches.data.length > 0 &&
                    (() => {
                        const match = nextMatches.data[0]
                        const team1 = teamsData.data?.find(
                            (team) => team.overviewPage === match.team1
                        )
                        const team2 = teamsData.data?.find(
                            (team) => team.overviewPage === match.team2
                        )
                        return (
                            <div className="flex flex-row items-center justify-center bg-transparent px-4 py-2 h-[125px] w-full">
                                {/* Team 1 */}
                                <div className="flex flex-col items-center w-16">
                                    {team1?.image && (
                                        <img
                                            src={team1Image.data || ''}
                                            alt={team1.short || ''}
                                            className="w-8 h-8 object-contain mb-1"
                                        />
                                    )}
                                    <span className="font-bold text-white text-xs">
                                        {team1?.short || match.team1}
                                    </span>
                                </div>

                                {/* Match info */}
                                <div className="flex flex-col items-center flex-1">
                                    <span className="font-semibold text-white text-sm">
                                        {match.dateTime_UTC
                                            ? new Date(
                                                  match.dateTime_UTC
                                              ).toLocaleTimeString([], {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : 'TBD'}
                                    </span>
                                    <span className="text-sm text-clear-grey mt-3">
                                        {match.dateTime_UTC
                                            ? new Date(
                                                  match.dateTime_UTC
                                              ).toLocaleDateString('fr-FR', {
                                                  day: '2-digit',
                                                  month: 'short',
                                              })
                                            : 'TBD'}
                                    </span>
                                </div>

                                {/* Team 2 */}
                                <div className="flex flex-col items-center w-16">
                                    {team2?.image && (
                                        <img
                                            src={team2Image.data || ''}
                                            alt={team2.short || ''}
                                            className="w-8 h-8 object-contain mb-1"
                                        />
                                    )}
                                    <span className="font-bold text-white text-xs">
                                        {team2?.short || match.team2}
                                    </span>
                                </div>
                            </div>
                        )
                    })()}
            </CardBody>
        </Card>
    )
}
