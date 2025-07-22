import React from 'react'
import { TeamRecentMatchesResponse } from '@/lib/api/teams'
import {
    MatchScheduleGame as MatchScheduleGameType,
    Standings as StandingsType,
} from '@/generated/prisma'
import { Tooltip } from './Tooltip'

export const Form = ({
    teamsRecentMatches,
    teamsRecentGames,
    standing,
}: {
    teamsRecentMatches?: TeamRecentMatchesResponse[]
    teamsRecentGames?: MatchScheduleGameType[]
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

    const teamFormGames = teamsRecentGames?.map((game) => {
        if (game.blue === standing.team) {
            return game.winner === 1 ? 'W' : 'L'
        } else if (game.red === standing.team) {
            return game.winner === 2 ? 'W' : 'L'
        }
        return 'L'
    })

    // Use teamFormGames if available, otherwise fallback to teamForm
    const displayForm =
        teamFormGames && teamFormGames.length > 0
            ? teamFormGames.join('')
            : teamForm

    // Filter games for the current team
    const teamGames = teamsRecentGames?.filter(
        (game) => game.blue === standing.team || game.red === standing.team
    )

    return (
        <div className="flex gap-1">
            {displayForm.split('').map((letter, index) => {
                // Get the corresponding match data for this form letter
                const teamMatches = teamsRecentMatches?.find(
                    (teamMatches) => teamMatches.team === standing.team
                )
                const matchData = teamMatches?.recentMatches?.[index]

                // Get the corresponding game data for this form letter
                const gameData = teamGames?.[index]

                // Determine which data source to use for tooltip
                const tooltipData = matchData || gameData

                return (
                    <Tooltip
                        content={
                            tooltipData ? (
                                <div className="text-center">
                                    <div className="font-semibold">
                                        {matchData?.team1 || gameData?.blue} vs{' '}
                                        {matchData?.team2 || gameData?.red}
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
