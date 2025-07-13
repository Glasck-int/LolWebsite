import { Type } from '@sinclair/typebox'
import { MatchScheduleGame } from '../generated/prisma'

export const MatchScheduleGameSchema = Type.Object({
    id: Type.Number(),
    overviewPage: Type.Optional(
        Type.String({ description: 'Overview page of the match' })
    ),
    uniqueLine: Type.Optional(
        Type.String({ description: 'Unique line of the match' })
    ),
    blue: Type.Optional(Type.String({ description: 'Blue team of the match' })),
    red: Type.Optional(Type.String({ description: 'Red team of the match' })),
    winner: Type.Optional(Type.Number({ description: 'Winner of the match' })),
    vod: Type.Optional(Type.String({ description: 'Vod of the match' })),
    createdAt: Type.Optional(Type.String({ description: 'Created at' })),
    updatedAt: Type.Optional(Type.String({ description: 'Updated at' })),
    blueFinal: Type.Optional(
        Type.String({ description: 'Blue final of the match' })
    ),
    blueFootnote: Type.Optional(
        Type.String({ description: 'Blue footnote of the match' })
    ),
    blueScore: Type.Optional(
        Type.Number({ description: 'Blue score of the match' })
    ),
    ff: Type.Optional(Type.Number({ description: 'FF of the match' })),
    footnote: Type.Optional(
        Type.String({ description: 'Footnote of the match' })
    ),
    gameId: Type.Optional(Type.String({ description: 'Game id of the match' })),
    hasRpgidInput: Type.Optional(
        Type.Boolean({ description: 'Has RPGID input of the match' })
    ),
    hasSelection: Type.Optional(
        Type.Boolean({ description: 'Has selection of the match' })
    ),
    ignoreRpgid: Type.Optional(
        Type.Boolean({ description: 'Ignore RPGID of the match' })
    ),
    interviewWith: Type.Optional(
        Type.Array(Type.String({ description: 'Interview with of the match' }))
    ),
    isChronobreak: Type.Optional(
        Type.Boolean({ description: 'Is chronobreak of the match' })
    ),
    isRemake: Type.Optional(
        Type.Boolean({ description: 'Is remake of the match' })
    ),
    matchHistory: Type.Optional(
        Type.String({ description: 'Match history of the match' })
    ),
    matchId: Type.Optional(
        Type.String({ description: 'Match id of the match' })
    ),
    mvp: Type.Optional(Type.String({ description: 'MVP of the match' })),
    mvpPoints: Type.Optional(
        Type.Number({ description: 'MVP points of the match' })
    ),
    nGameInMatch: Type.Optional(
        Type.Number({ description: 'Number of game in match of the match' })
    ),
    nMatchInTab: Type.Optional(
        Type.Number({ description: 'Number of match in tab of the match' })
    ),
    nPage: Type.Optional(
        Type.Number({ description: 'Number of page of the match' })
    ),
    nTabInPage: Type.Optional(
        Type.Number({ description: 'Number of tab in page of the match' })
    ),
    initialNMatchInTab: Type.Optional(
        Type.Number({
            description: 'Initial number of match in tab of the match',
        })
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
    redFinal: Type.Optional(
        Type.String({ description: 'Red final of the match' })
    ),
    redFootnote: Type.Optional(
        Type.String({ description: 'Red footnote of the match' })
    ),
    redScore: Type.Optional(
        Type.Number({ description: 'Red score of the match' })
    ),
    reddit: Type.Optional(Type.String({ description: 'Reddit of the match' })),
    riotGameId: Type.Optional(
        Type.String({ description: 'Riot game id of the match' })
    ),
    riotHash: Type.Optional(
        Type.String({ description: 'Riot hash of the match' })
    ),
    riotPlatformGameId: Type.Optional(
        Type.String({ description: 'Riot platform game id of the match' })
    ),
    riotPlatformId: Type.Optional(
        Type.String({ description: 'Riot platform id of the match' })
    ),
    riotVersion: Type.Optional(
        Type.Number({ description: 'Riot version of the match' })
    ),
    selection: Type.Optional(
        Type.String({ description: 'Selection of the match' })
    ),
    versionedRpgid: Type.Optional(
        Type.String({ description: 'Versioned RPGID of the match' })
    ),
    vodGameStart: Type.Optional(
        Type.String({ description: 'Vod game start of the match' })
    ),
    vodHighlights: Type.Optional(
        Type.String({ description: 'Vod highlights of the match' })
    ),
    vodInterview: Type.Optional(
        Type.String({ description: 'Vod interview of the match' })
    ),
    vodPostgame: Type.Optional(
        Type.String({ description: 'Vod postgame of the match' })
    ),
    writtenSummary: Type.Optional(
        Type.String({ description: 'Written summary of the match' })
    ),
    MatchSchedule: Type.Optional(
        Type.String({ description: 'Match schedule of the match' })
    ),
})

export const MatchScheduleGameListResponse = Type.Array(MatchScheduleGameSchema)

export type MatchScheduleGameType = MatchScheduleGame