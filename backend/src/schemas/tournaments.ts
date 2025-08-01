import { Type } from '@sinclair/typebox'
/**
 * Tournament schema with comprehensive field descriptions and validation
 */
const TournamentSchema = Type.Object({
    id: Type.Number({ 
        description: 'Unique identifier for the tournament',
        examples: [1, 2, 3]
    }),
    name: Type.String({ 
        minLength: 1,
        maxLength: 200,
        description: 'Full name of the tournament',
        examples: ['LEC 2024 Spring', 'World Championship 2024']
    }),
    overviewPage: Type.String({
        minLength: 1,
        maxLength: 300,
        description: 'Leaguepedia overview page identifier for the tournament',
        examples: ['LEC_2024_Spring', 'Worlds_2024_Main']
    }),
    dateStart: Type.Optional(
        Type.String({ 
            format: 'date',
            description: 'Tournament start date (YYYY-MM-DD format)',
            examples: ['2024-01-13', '2024-09-25']
        })
    ),
    dateEnd: Type.Optional(
        Type.String({ 
            format: 'date',
            description: 'Tournament end date (YYYY-MM-DD format)',
            examples: ['2024-04-14', '2024-11-02']
        })
    ),
    dateStartFuzzy: Type.Optional(
        Type.String({
            description: 'Start date of the tournament in fuzzy format',
        })
    ),
    league: Type.Optional(
        Type.String({ 
            minLength: 1,
            maxLength: 100,
            description: 'League that organizes this tournament',
            examples: ['LEC', 'LCS', 'Worlds']
        })
    ),
    region: Type.Optional(
        Type.String({ 
            minLength: 1,
            maxLength: 50,
            description: 'Geographic region where the tournament takes place',
            examples: ['Europe', 'North America', 'International']
        })
    ),
    prizePool: Type.Optional(
        Type.String({ 
            description: 'Total prize pool amount as string',
            examples: ['250000', '2225000', '1000000']
        })
    ),
    prizePoolCurrency: Type.Optional(
        Type.String({ 
            minLength: 1,
            maxLength: 10,
            description: 'Currency code for the prize pool',
            examples: ['USD', 'EUR', 'KRW']
        })
    ),
    country: Type.Optional(
        Type.String({ 
            minLength: 1,
            maxLength: 100,
            description: 'Country where the tournament is hosted',
            examples: ['Germany', 'United States', 'Korea']
        })
    ),
    closestTimezone: Type.Optional(
        Type.String({ description: 'Closest timezone of the tournament' })
    ),
    rulebook: Type.Optional(
        Type.String({ description: 'Rulebook of the tournament' })
    ),
    eventType: Type.Optional(
        Type.String({ 
            minLength: 1,
            maxLength: 50,
            description: 'Type/format of the tournament',
            examples: ['League', 'Playoffs', 'International']
        })
    ),
    links: Type.Optional(
        Type.String({ description: 'Links of the tournament' })
    ),
    sponsors: Type.Optional(
        Type.String({ description: 'Sponsors of the tournament' })
    ),
    organizer: Type.Optional(
        Type.String({ description: 'Organizer of the tournament' })
    ),
    organizers: Type.Optional(
        Type.String({ description: 'Organizers of the tournament' })
    ),
    standardName: Type.Optional(
        Type.String({ description: 'Standard name of the tournament' })
    ),
    standardNameRedirect: Type.Optional(
        Type.String({ description: 'Standard name redirect of the tournament' })
    ),
    basePage: Type.Optional(
        Type.String({ description: 'Base page of the tournament' })
    ),
    split: Type.Optional(
        Type.String({ description: 'Split of the tournament' })
    ),
    splitNumber: Type.Optional(
        Type.Number({ description: 'Split number of the tournament' })
    ),
    splitMainPage: Type.Optional(
        Type.String({ description: 'Split main page of the tournament' })
    ),
    tournamentLevel: Type.Optional(
        Type.String({ description: 'Importance of the tournament' })
    ),
    isQualifier: Type.Optional(
        Type.Boolean({ description: 'Whether the tournament is a qualifier' })
    ),
    isPlayoffs: Type.Optional(
        Type.Boolean({ description: 'Whether the tournament is a playoff' })
    ),
    isOfficial: Type.Optional(
        Type.Boolean({ description: 'Whether the tournament is official' })
    ),
    year: Type.Optional(Type.String({ 
        pattern: '^[0-9]{4}$',
        description: 'Year when the tournament takes place',
        examples: ['2024', '2023', '2025']
    })),
    leagueIconKey: Type.Optional(
        Type.String({ description: 'Icon key of the league' })
    ),
    alternativeNamesFull: Type.Optional(
        Type.String({ description: 'Alternative names of the tournament' })
    ),
    scrapeLink: Type.Optional(
        Type.String({ description: 'Scrape link of the tournament' })
    ),
    tagsFull: Type.Optional(
        Type.String({ description: 'Tags of the tournament' })
    ),
    suppressTopSchedule: Type.Optional(
        Type.Boolean({
            description:
                'Whether the tournament is suppressed from the top schedule',
        })
    ),
    dateStartPrecision: Type.Optional(
        Type.Number({
            description: 'Precision of the start date of the tournament',
        })
    ),
    dateEndPrecision: Type.Optional(
        Type.Number({
            description: 'Precision of the end date of the tournament',
        })
    ),
    dateStartFuzzyPrecision: Type.Optional(
        Type.Number({
            description:
                'Precision of the start date of the tournament in fuzzy format',
        })
    ),
    createdAt: Type.String({
        format: 'date-time',
        description: 'Creation date of the tournament in db',
    }),
    updatedAt: Type.String({
        format: 'date-time',
        description: 'Last update date of the tournament in db',
    }),
})

/**
 * Tournament groups schema
 */
const TournamentGroupSchema = Type.Object({
    groupName: Type.String({
        description: 'Name of the tournament group',
        examples: ['Group A', 'Group B', 'Swiss Stage']
    }),
    groupDisplay: Type.Optional(Type.String({
        description: 'Display name for the group',
        examples: ['Group A', 'Swiss Stage']
    })),
    groupN: Type.Optional(Type.Number({
        description: 'Group number for ordering',
        examples: [1, 2, 3]
    })),
})

/**
 * Team information schema for standings
 */
const TeamInStandingsSchema = Type.Object({
    name: Type.String({
        description: 'Team name',
        examples: ['G2 Esports', 'T1', 'Fnatic']
    }),
    short: Type.Optional(Type.String({
        description: 'Team short name/abbreviation',
        examples: ['G2', 'T1', 'FNC']
    })),
    region: Type.Optional(Type.String({
        description: 'Team region',
        examples: ['Europe', 'Korea', 'North America']
    })),
    image: Type.Optional(Type.String({
        description: 'Team logo/image URL'
    })),
    TournamentGroups: Type.Array(TournamentGroupSchema, {
        description: 'Tournament groups this team belongs to'
    }),
})

/**
 * Tournament standings schema with detailed field descriptions
 */
 const TournamentStandingsResponse = Type.Object({
    id: Type.Number({ 
        description: 'Unique identifier for the standings entry',
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
    team: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 100,
        description: 'Name of the team in standings',
        examples: ['G2 Esports', 'T1', 'Fnatic']
    })),
    pageAndTeam: Type.Optional(Type.String({ description: 'Page and team' })),
    n: Type.Optional(Type.Number({ description: 'N of the team' })),
    place: Type.Optional(Type.Number({ 
        minimum: 1,
        description: 'Current position/rank of the team in standings',
        examples: [1, 2, 3, 4]
    })),
    winSeries: Type.Optional(
        Type.Number({ 
            minimum: 0,
            description: 'Number of series/matches won by the team',
            examples: [12, 8, 15]
        })
    ),
    lossSeries: Type.Optional(
        Type.Number({ 
            minimum: 0,
            description: 'Number of series/matches lost by the team',
            examples: [3, 7, 1]
        })
    ),
    tieSeries: Type.Optional(
        Type.Number({ description: 'Tie series of the team' })
    ),
    winGames: Type.Optional(
        Type.Number({ 
            minimum: 0,
            description: 'Number of individual games won by the team',
            examples: [28, 19, 32]
        })
    ),
    lossGames: Type.Optional(
        Type.Number({ 
            minimum: 0,
            description: 'Number of individual games lost by the team',
            examples: [12, 17, 8]
        })
    ),
    points: Type.Optional(Type.Number({ 
        minimum: 0,
        description: 'Total points earned by the team',
        examples: [36, 24, 45]
    })),
    pointsTiebreaker: Type.Optional(
        Type.Number({ description: 'Points tiebreaker of the team' })
    ),
    streak: Type.Optional(Type.Number({ description: 'Streak of the team' })),
    streakDirection: Type.Optional(
        Type.String({ description: 'Streak direction of the team' })
    ),
    createdAt: Type.String({
        format: 'date-time',
        description: 'Creation date of the standings in db',
    }),
    updatedAt: Type.String({
        format: 'date-time',
        description: 'Last update date of the standings in db',
    }),
    Team: Type.Optional(TeamInStandingsSchema),
})

const TournamentGamesListResponse = Type.Object({
    id: Type.Number({ description: 'Unique identifier for the game' }),
})

/**
 * Create and Update schemas for tournaments
 */
const CreateTournamentSchema = Type.Omit(TournamentSchema, ['id', 'createdAt', 'updatedAt'])
const UpdateTournamentSchema = Type.Partial(CreateTournamentSchema)

/**
 * Response arrays
 */
const TournamentListResponse = Type.Array(TournamentSchema)
const TournamentStandingsListResponse = Type.Array(TournamentStandingsResponse)
export {
    TournamentSchema,
    CreateTournamentSchema,
    UpdateTournamentSchema,
    TournamentListResponse,
    TournamentStandingsResponse,
    TournamentStandingsListResponse,
}
