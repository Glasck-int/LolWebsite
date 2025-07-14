import { Type } from '@sinclair/typebox'

/**
 * Common query parameter validation schemas
 */

/**
 * Pagination query parameters
 */
export const PaginationQuerySchema = Type.Object({
    page: Type.Optional(Type.Number({
        minimum: 1,
        default: 1,
        description: 'Page number (starts at 1)',
        examples: [1, 2, 3]
    })),
    limit: Type.Optional(Type.Number({
        minimum: 1,
        maximum: 100,
        default: 20,
        description: 'Number of items per page (max 100)',
        examples: [10, 20, 50]
    }))
})

/**
 * Date range query parameters
 */
export const DateRangeQuerySchema = Type.Object({
    from: Type.Optional(Type.String({
        format: 'date',
        description: 'Start date (YYYY-MM-DD)',
        examples: ['2024-01-01', '2024-03-15']
    })),
    to: Type.Optional(Type.String({
        format: 'date',
        description: 'End date (YYYY-MM-DD)',
        examples: ['2024-12-31', '2024-06-30']
    }))
})

/**
 * Sorting query parameters
 */
export const SortQuerySchema = Type.Object({
    sort: Type.Optional(Type.String({
        enum: ['asc', 'desc'],
        default: 'desc',
        description: 'Sort order',
        examples: ['asc', 'desc']
    })),
    sortBy: Type.Optional(Type.String({
        description: 'Field to sort by',
        examples: ['date', 'name', 'score']
    }))
})

/**
 * Search query parameters
 */
export const SearchQuerySchema = Type.Object({
    search: Type.Optional(Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Search term',
        examples: ['G2', 'LEC', 'Spring']
    }))
})

/**
 * Team filter query parameters
 */
export const TeamFilterQuerySchema = Type.Object({
    team: Type.Optional(Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Filter by team name',
        examples: ['G2 Esports', 'T1']
    }))
})

/**
 * Tournament filter query parameters
 */
export const TournamentFilterQuerySchema = Type.Object({
    tournament: Type.Optional(Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Filter by tournament',
        examples: ['LEC_2024_Spring', 'Worlds_2024']
    }))
})

/**
 * Status filter query parameters
 */
export const StatusFilterQuerySchema = Type.Object({
    status: Type.Optional(Type.String({
        enum: ['upcoming', 'live', 'completed'],
        description: 'Filter by match status',
        examples: ['upcoming', 'live', 'completed']
    }))
})

/**
 * League filter query parameters
 */
export const LeagueFilterQuerySchema = Type.Object({
    league: Type.Optional(Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Filter by league name',
        examples: ['LEC', 'LCS', 'LCK']
    }))
})

/**
 * Combined match filters
 */
export const MatchFilterQuerySchema = Type.Intersect([
    PaginationQuerySchema,
    DateRangeQuerySchema,
    SortQuerySchema,
    TeamFilterQuerySchema,
    TournamentFilterQuerySchema,
    StatusFilterQuerySchema
])

/**
 * Combined tournament query filters
 */
export const TournamentQueryFiltersSchema = Type.Intersect([
    PaginationQuerySchema,
    SearchQuerySchema,
    LeagueFilterQuerySchema,
    SortQuerySchema
])

/**
 * Combined team filters
 */
export const TeamQuerySchema = Type.Intersect([
    PaginationQuerySchema,
    SearchQuerySchema,
    LeagueFilterQuerySchema,
    SortQuerySchema
])

/**
 * Game statistics query parameters
 */
export const GameStatsQuerySchema = Type.Object({
    includeStats: Type.Optional(Type.Boolean({
        default: false,
        description: 'Include detailed game statistics',
        examples: [true, false]
    })),
    includeTimeline: Type.Optional(Type.Boolean({
        default: false,
        description: 'Include game timeline events',
        examples: [true, false]
    }))
})