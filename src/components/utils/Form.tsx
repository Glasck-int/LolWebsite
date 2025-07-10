import React from 'react'
import { TeamRecentMatchesResponse } from '@/lib/api/teams'
import { Standings as StandingsType } from '../../../backend/src/generated/prisma'
import { Tooltip } from './Tooltip'
export const Form = ({
    teamsRecentMatches,
    standing,
}: {
    teamsRecentMatches: TeamRecentMatchesResponse[]
    standing: StandingsType
}) => {
    // Get team form from recent matches in the specific tournament
    // Use fallback to winSeries if recent matches data is not available
    const teamForm =
        teamsRecentMatches?.find(
            (teamMatches) => teamMatches.team === standing.team
        )?.form ||
        standing.winSeries?.toString() ||
        ''

    return (
        <div className="flex gap-1">
            {teamForm.split('').map((letter, index) => {
                // Get the corresponding match data for this form letter
                const teamMatches = teamsRecentMatches?.find(
                    (teamMatches) => teamMatches.team === standing.team
                )
                const matchData = teamMatches?.recentMatches?.[index]
                // console.log(matchData)
                return (
                    <Tooltip
                        content={
                            matchData ? (
                                <div className="text-center">
                                    <div className="font-semibold">
                                        {matchData.team1} vs {matchData.team2}
                                    </div>
                                    <div className="text-sm text-grey">
                                        {matchData.dateTime_UTC
                                            ? new Date(
                                                  matchData.dateTime_UTC
                                              ).toLocaleDateString()
                                            : ''}
                                    </div>
                                </div>
                            ) : null
                        }
                        key={index}
                    >
                        <div
                            className={`w-6 h-6 flex items-center justify-center text-sm font-semibold rounded cursor-pointer transition-all duration-200 ${
                                letter === 'W'
                                    ? 'bg-[#1E895E]/25 text-[#1E895E] rounded-md hover:bg-[#1E895E]/40'
                                    : letter === 'L'
                                    ? 'bg-[#C01D56]/25 text-[#C01D56] rounded-md hover:bg-[#C01D56]/40'
                                    : 'bg-[#1E895E]/25 text-[#1E895E] rounded-md hover:bg-[#1E895E]/40'
                            }`}
                        >
                            {letter}
                        </div>
                    </Tooltip>
                )
            })}
        </div>
    )
}
