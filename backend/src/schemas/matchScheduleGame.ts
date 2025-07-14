import { Type } from '@sinclair/typebox'
import { MatchScheduleGame } from '../generated/prisma'

/**
 * MatchScheduleGame schema with comprehensive validation and descriptions
 */
export const MatchScheduleGameSchema = Type.Object({
    id: Type.Number({
        description: 'Unique identifier for the game',
        examples: [1, 2, 3]
    }),
    overviewPage: Type.Optional(
        Type.String({ 
            minLength: 1,
            maxLength: 300,
            description: 'Tournament overview page identifier',
            examples: ['LEC_2024_Spring', 'Worlds_2024_Main']
        })
    ),
    uniqueLine: Type.Optional(
        Type.String({ description: 'Unique line of the match' })
    ),
    blue: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 100,
        description: 'Name of the blue side team',
        examples: ['G2 Esports', 'T1', 'Fnatic']
    })),
    red: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 100,
        description: 'Name of the red side team',
        examples: ['Team Liquid', 'Cloud9', 'MAD Lions']
    })),
    winner: Type.Optional(Type.Number({ 
        minimum: 1,
        maximum: 2,
        description: 'Winning team (1 for blue, 2 for red)',
        examples: [1, 2]
    })),
    vod: Type.Optional(Type.String({ 
        format: 'uri',
        description: 'Video on demand URL for the game',
        examples: ['https://youtube.com/watch?v=abc123']
    })),
    createdAt: Type.Optional(Type.String({ 
        format: 'date-time',
        description: 'Database creation timestamp',
        examples: ['2024-01-15T10:30:00Z']
    })),
    updatedAt: Type.Optional(Type.String({ 
        format: 'date-time',
        description: 'Database last update timestamp',
        examples: ['2024-01-15T10:30:00Z']
    })),
    blueFinal: Type.Optional(
        Type.String({ description: 'Blue final of the match' })
    ),
    blueFootnote: Type.Optional(
        Type.String({ description: 'Blue footnote of the match' })
    ),
    blueScore: Type.Optional(
        Type.Number({ 
            minimum: 0,
            description: 'Final score/kills for blue team',
            examples: [25, 18, 32]
        })
    ),
    ff: Type.Optional(Type.Number({ description: 'FF of the match' })),
    footnote: Type.Optional(
        Type.String({ description: 'Footnote of the match' })
    ),
    gameId: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 100,
        description: 'Unique game identifier',
        examples: ['ESPORTSTMNT01_2024_1', 'GAME_123456']
    })),
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
        Type.String({ 
            minLength: 1,
            maxLength: 100,
            description: 'Parent match identifier',
            examples: ['MATCH_123', 'LEC_2024_M001']
        })
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
    patch: Type.Optional(Type.String({ 
        pattern: '^[0-9]+\.[0-9]+$',
        description: 'Game patch version (e.g., 14.1)',
        examples: ['14.1', '13.24', '14.5']
    })),
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
        Type.Number({ 
            minimum: 0,
            description: 'Final score/kills for red team',
            examples: [15, 22, 28]
        })
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

/**
 * Create and Update schemas for match schedule games
 */
export const CreateMatchScheduleGameSchema = Type.Omit(MatchScheduleGameSchema, ['id', 'createdAt', 'updatedAt'])
export const UpdateMatchScheduleGameSchema = Type.Partial(CreateMatchScheduleGameSchema)

/**
 * Response arrays and types
 */
export const MatchScheduleGameListResponse = Type.Array(MatchScheduleGameSchema)

export type MatchScheduleGameType = MatchScheduleGame