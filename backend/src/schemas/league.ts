import { Type } from '@sinclair/typebox'

/**
 * Base league schema with all properties
 */
export const LeagueSchema = Type.Object({
    id: Type.String({ description: 'Unique identifier for the league' }),
    name: Type.String({
        minLength: 1,
        description: 'Name of the league',
    }),
    short: Type.String({
        minLength: 1,
        description: 'Short name of the league',
    }),
    region: Type.String({
        minLength: 1,
        description: 'Region of the league',
    }),
    level: Type.String({
        minLength: 1,
        description: 'Level of the league',
    }),
    isOfficial: Type.Boolean({
        description: 'Whether the league is official',
    }),
    isMajor: Type.Boolean({
        description: 'Whether the league is major',
    }),
    createdAt: Type.String({
        format: 'date-time',
        description: 'Date and time when the league was created in database',
    }),
    updatedAt: Type.String({
        format: 'date-time',
        description:
            'Date and time when the league was last updated in database',
    }),
})

/**
 * Schema for creating a new league (without id)
 */
export const CreateLeagueSchema = Type.Omit(LeagueSchema, ['id'])

/**
 * Schema for updating a league (all fields optional except id)
 */
export const UpdateLeagueSchema = Type.Partial(CreateLeagueSchema)

/**
 * Schema for league list response
 */
export const LeagueListResponse = Type.Array(LeagueSchema)
