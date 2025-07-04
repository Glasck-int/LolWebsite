import { Type } from '@sinclair/typebox'

export const TeamSchema = Type.Object({
    id: Type.Number(),
    name: Type.String(),
    short: Type.Optional(Type.String()),
    location: Type.Optional(Type.String()),
    region: Type.Optional(Type.String()),
    image: Type.Optional(Type.String()),
    isDisbanded: Type.Boolean(),
    youtube: Type.Optional(Type.String()),
    twitter: Type.Optional(Type.String()),
    instagram: Type.Optional(Type.String()),
    facebook: Type.Optional(Type.String()),
    vk: Type.Optional(Type.String()),
    bluesky: Type.Optional(Type.String()),
    discord: Type.Optional(Type.String()),
    subreddit: Type.Optional(Type.String()),
    snapchat: Type.Optional(Type.String()),
    renamedTo: Type.Optional(Type.String()),
    isLowercase: Type.Boolean(),
    overviewPage: Type.Optional(Type.String()),
    updatedAt: Type.String(),
    // PlayerImage: Type.Array(PlayerImageSchema),
    // ScoreboardTeam: Type.Array(ScoreboardTeamSchema),
    // Standings: Type.Array(StandingsSchema),
})

export const TeamListResponse = Type.Array(TeamSchema)
