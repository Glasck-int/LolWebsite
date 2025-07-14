import { Type } from '@sinclair/typebox'

/**
 * Base league schema with all properties
 */
export const LeagueSchema = Type.Object({
    id: Type.Number({ 
        description: 'Unique identifier for the league',
        examples: [1, 2, 3]
    }),
    name: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Full name of the league',
        examples: ['League of Legends Championship Series', 'League of Legends European Championship']
    }),
    slug: Type.Optional(Type.String({
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-z0-9-]+$',
        description: 'URL-friendly slug identifier for the league',
        examples: ['lcs', 'lec', 'lck']
    })),
    short: Type.String({
        minLength: 1,
        maxLength: 20,
        description: 'Abbreviated name of the league',
        examples: ['LCS', 'LEC', 'LCK', 'LPL']
    }),
    region: Type.String({
        minLength: 1,
        maxLength: 50,
        description: 'Geographic region of the league',
        examples: ['North America', 'Europe', 'Korea', 'China']
    }),
    level: Type.String({
        minLength: 1,
        maxLength: 30,
        description: 'Competitive level or tier of the league',
        examples: ['Primary', 'Secondary', 'Academy', 'Regional']
    }),
    isOfficial: Type.Boolean({
        description: 'Whether the league is officially recognized by Riot Games',
        examples: [true, false]
    }),
    isMajor: Type.Boolean({
        description: 'Whether the league is considered a major international competition',
        examples: [true, false]
    }),
    createdAt: Type.String({
        format: 'date-time',
        description: 'ISO 8601 timestamp when the league was created in database',
        examples: ['2024-01-15T10:30:00Z']
    }),
    updatedAt: Type.String({
        format: 'date-time',
        description: 'ISO 8601 timestamp when the league was last updated in database',
        examples: ['2024-01-15T10:30:00Z']
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
