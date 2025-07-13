import { Type } from '@sinclair/typebox'
import { MatchSchedule } from '../generated/prisma'

/**
 * MatchSchedule schema for API responses
 *
 * Uses Prisma-generated types to ensure type safety
 */
export const MatchScheduleSchema = Type.Object({
    id: Type.Number(),
    dateTime_UTC: Type.Optional(Type.String({ format: 'date-time' })),
    team1: Type.Optional(
        Type.String({ description: 'Name of the first team' })
    ),
    team2: Type.Optional(
        Type.String({ description: 'Name of the second team' })
    ),
    dst: Type.Optional(
        Type.String({ description: 'Destination of the match' })
    ),
    round: Type.Optional(Type.String({ description: 'Round of the match' })),
    winner: Type.Optional(Type.String({ description: 'Winner of the match' })),
    team1Points: Type.Optional(
        Type.Number({ description: 'Points of the first team' })
    ),
    team2Points: Type.Optional(
        Type.Number({ description: 'Points of the second team' })
    ),
    team1Score: Type.Optional(
        Type.Number({ description: 'Score of the first team' })
    ),
    team2Score: Type.Optional(
        Type.Number({ description: 'Score of the second team' })
    ),
    tab: Type.Optional(Type.String({ description: 'Tab of the match' })),
    groupName: Type.Optional(
        Type.String({ description: 'Group name of the match' })
    ),
    castersPBP: Type.Optional(
        Type.String({ description: 'Casters of the match' })
    ),
    castersColor: Type.Optional(
        Type.String({ description: 'Color of the casters' })
    ),
    mvp: Type.Optional(Type.String({ description: 'MVP of the match' })),
    overviewPage: Type.Optional(
        Type.String({ description: 'Overview page of the match' })
    ),
    createdAt: Type.Optional(Type.String({ description: 'Created at' })),
    updatedAt: Type.Optional(Type.String({ description: 'Updated at' })),
    bestOf: Type.Optional(Type.Number({ description: 'Best of' })),
    casters: Type.Optional(
        Type.Array(Type.String({ description: 'Casters of the match' }))
    ),
    disabledChampions: Type.Optional(
        Type.Array(
            Type.String({ description: 'Disabled champions of the match' })
        )
    ),
    ff: Type.Optional(Type.Number({ description: 'FF of the match' })),
    footnote: Type.Optional(
        Type.String({ description: 'Footnote of the match' })
    ),
    hasTime: Type.Optional(Type.Boolean({ description: 'Has time' })),
    hotfix: Type.Optional(Type.String({ description: 'Hotfix of the match' })),
    initialPageAndTab: Type.Optional(
        Type.String({ description: 'Initial page and tab of the match' })
    ),
    interviewWith: Type.Optional(
        Type.Array(Type.String({ description: 'Interview with of the match' }))
    ),
    isFlexibleStart: Type.Optional(
        Type.Boolean({ description: 'Is flexible start' })
    ),
    isNullified: Type.Optional(Type.Boolean({ description: 'Is nullified' })),
    isReschedulable: Type.Optional(
        Type.Boolean({ description: 'Is reschedulable' })
    ),
    isTiebreaker: Type.Optional(Type.Boolean({ description: 'Is tiebreaker' })),
    legacyPatch: Type.Optional(
        Type.String({ description: 'Legacy patch of the match' })
    ),
    matchDay: Type.Optional(
        Type.Number({ description: 'Match day of the match' })
    ),
    matchId: Type.Optional(
        Type.String({ description: 'Match id of the match' })
    ),
    mvpPoints: Type.Optional(
        Type.Number({ description: 'MVP points of the match' })
    ),
    overrideAllowPredictions: Type.Optional(
        Type.Boolean({ description: 'Override allow predictions' })
    ),
    overrideDisallowPredictions: Type.Optional(
        Type.Boolean({ description: 'Override disallow predictions' })
    ),
    pageAndTeam1: Type.Optional(
        Type.String({ description: 'Page and team 1 of the match' })
    ),
    pageAndTeam2: Type.Optional(
        Type.String({ description: 'Page and team 2 of the match' })
    ),
    patch: Type.Optional(Type.String({ description: 'Patch of the match' })),
    patchFootnote: Type.Optional(
        Type.String({ description: 'Patch footnote of the match' })
    ),
    patchPage: Type.Optional(
        Type.String({ description: 'Patch page of the match' })
    ),
    phase: Type.Optional(Type.String({ description: 'Phase of the match' })),
    player1: Type.Optional(
        Type.String({ description: 'Player 1 of the match' })
    ),
    player2: Type.Optional(
        Type.String({ description: 'Player 2 of the match' })
    ),
    qq: Type.Optional(Type.Number({ description: 'QQ of the match' })),
    recap: Type.Optional(Type.String({ description: 'Recap of the match' })),
    reddit: Type.Optional(Type.String({ description: 'Reddit of the match' })),
    shownName: Type.Optional(
        Type.String({ description: 'Shown name of the match' })
    ),
    shownRound: Type.Optional(
        Type.String({ description: 'Shown round of the match' })
    ),
    stream: Type.Optional(Type.String({ description: 'Stream of the match' })),
    streamDisplay: Type.Optional(
        Type.String({ description: 'Stream display of the match' })
    ),
    tags: Type.Optional(
        Type.Array(Type.String({ description: 'Tags of the match' }))
    ),
    team1Advantage: Type.Optional(
        Type.Number({ description: 'Team 1 advantage of the match' })
    ),
    team1Final: Type.Optional(
        Type.String({ description: 'Team 1 final of the match' })
    ),
    team1Footnote: Type.Optional(
        Type.String({ description: 'Team 1 footnote of the match' })
    ),
    team1PointsTB: Type.Optional(
        Type.Number({ description: 'Team 1 points TB of the match' })
    ),
    team1Poster: Type.Optional(
        Type.String({ description: 'Team 1 poster of the match' })
    ),
    team2Advantage: Type.Optional(
        Type.Number({ description: 'Team 2 advantage of the match' })
    ),
    team2Final: Type.Optional(
        Type.String({ description: 'Team 2 final of the match' })
    ),
    team2Footnote: Type.Optional(
        Type.String({ description: 'Team 2 footnote of the match' })
    ),
    team2PointsTB: Type.Optional(
        Type.Number({ description: 'Team 2 points TB of the match' })
    ),
    team2Poster: Type.Optional(
        Type.String({ description: 'Team 2 poster of the match' })
    ),
    uniqueMatch: Type.Optional(
        Type.String({ description: 'Unique match of the match' })
    ),
    venue: Type.Optional(Type.String({ description: 'Venue of the match' })),
    vodHighlights: Type.Optional(
        Type.String({ description: 'Vod highlights of the match' })
    ),
    vodInterview: Type.Optional(
        Type.String({ description: 'Vod interview of the match' })
    ),
    wanplus: Type.Optional(
        Type.String({ description: 'Wanplus of the match' })
    ),
    wanplusId: Type.Optional(
        Type.Number({ description: 'Wanplus id of the match' })
    ),
    nMatchInPage: Type.Optional(
        Type.Number({ description: 'Number of matches in page of the match' })
    ),
    nMatchInTab: Type.Optional(
        Type.Number({ description: 'Number of matches in tab of the match' })
    ),
    nPage: Type.Optional(
        Type.Number({ description: 'Number of pages of the match' })
    ),
    nTabInPage: Type.Optional(
        Type.Number({ description: 'Number of tabs in page of the match' })
    ),
    initialNMatchInTab: Type.Optional(
        Type.Number({
            description: 'Initial number of matches in tab of the match',
        })
    ),
})

export const MatchScheduleListResponse = Type.Array(MatchScheduleSchema)

// Export Prisma type for direct use
export type MatchScheduleType = MatchSchedule
