import { Type } from '@sinclair/typebox'

export const PlayoffMatchSchema = Type.Object({
    matchId: Type.String(),
    teamA: Type.String(),
    teamB: Type.String(),
    shortA: Type.Optional(Type.String()),
    shortB: Type.Optional(Type.String()),
    team1Score: Type.Union([Type.Number(), Type.Null()]),
    team2Score: Type.Union([Type.Number(), Type.Null()]),
    dateTime_UTC: Type.Union([Type.String(), Type.Null()]),
    imageA: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    imageB: Type.Optional(Type.Union([Type.String(), Type.Null()])),
})

export const PlayoffTabSchema = Type.Object({
    tabName: Type.String(),
    matchs: Type.Array(PlayoffMatchSchema),
})

export const PlayoffPageSchema = Type.Object({
    pageName: Type.String(),
    nTabInPage: Type.Number(),
    tabs: Type.Array(PlayoffTabSchema),
})

export const PlayoffBracketResponse = Type.Array(PlayoffPageSchema)