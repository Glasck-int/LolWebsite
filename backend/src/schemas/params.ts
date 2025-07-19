import { Type } from '@sinclair/typebox'

/**
 * Common parameter validation schemas
 */

/**
 * Generic ID parameter (numeric)
 */
export const IdParamSchema = Type.Object({
    id: Type.String({
        pattern: '^[0-9]+$',
        description: 'Numeric ID',
        examples: ['123', '456']
    })
})

/**
 * League slug parameter
 */
export const LeagueSlugParamSchema = Type.Object({
    slug: Type.String({
        minLength: 1,
        maxLength: 50,
        pattern: '^[a-zA-Z0-9-_]+$',
        description: 'League slug identifier',
        examples: ['lec', 'lcs', 'worlds-2024']
    })
})

/**
 * Team name parameter
 */
export const TeamNameParamSchema = Type.Object({
    name: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Team name',
        examples: ['G2 Esports', 'T1', 'Fnatic']
    })
})

/**
 * Tournament identifier parameter
 */
export const TournamentParamSchema = Type.Object({
    tournament: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Tournament identifier',
        examples: ['LEC_2024_Spring', 'Worlds_2024']
    })
})

/**
 * Tournament ID parameter
 */
export const TournamentIdParamSchema = Type.Object({
    tournamentId: Type.String({
        pattern: '^[0-9]+$',
        description: 'Tournament numeric ID',
        examples: ['123', '456']
    })
})



/**
 * Overview page parameter
 */
export const OverviewPageParamSchema = Type.Object({
    overviewPage: Type.String({
        minLength: 1,
        maxLength: 200,
        description: 'Tournament overview page identifier',
        examples: ['LEC_2024_Spring', 'Worlds_2024_Main']
    })
})

/**
 * Tournament overview page parameter (alternative name)
 */
export const TournamentOverviewPageParamSchema = Type.Object({
    tournamentOverviewPage: Type.String({
        minLength: 1,
        maxLength: 200,
        description: 'Tournament overview page identifier',
        examples: ['LEC_2024_Spring', 'Worlds_2024_Main']
    })
})

/**
 * League name parameter
 */
export const LeagueNameParamSchema = Type.Object({
    name: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'League name',
        examples: ['LEC', 'LCS', 'LCK']
    })
})

/**
 * League name parameter for tournaments route
 */
export const TournamentLeagueNameParamSchema = Type.Object({
    leagueName: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'League name',
        examples: ['LEC', 'LCS', 'LCK']
    })
})

/**
 * Combined team and tournament parameters
 */
export const TeamTournamentParamsSchema = Type.Object({
    name: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Team name',
        examples: ['G2 Esports', 'T1']
    }),
    tournament: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Tournament identifier',
        examples: ['LEC_2024_Spring', 'Worlds_2024']
    })
})

/**
 * Match ID parameter
 */
export const MatchIdParamSchema = Type.Object({
    matchId: Type.String({
        pattern: '^[0-9]+$',
        description: 'Match numeric ID',
        examples: ['123', '456']
    })
})

/**
 * Game ID parameter
 */
export const GameIdParamSchema = Type.Object({
    gameId: Type.String({
        pattern: '^[0-9]+$',
        description: 'Game numeric ID',
        examples: ['123', '456']
    })
})