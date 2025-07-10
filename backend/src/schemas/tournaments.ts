import { Type } from '@sinclair/typebox'
import { SuccessResponseSchema } from './common'

const TournamentSchema = Type.Object({
    id: Type.Number({ description: 'Unique identifier for the tournament' }),
    name: Type.String({ description: 'Name of the tournament' }),
    overviewPage: Type.String({
        description: 'Overview page of the tournament in leaguepedia',
    }),
    dateStart: Type.Optional(
        Type.String({ description: 'Start date of the tournament' })
    ),
    dateEnd: Type.Optional(
        Type.String({ description: 'End date of the tournament' })
    ),
    dateStartFuzzy: Type.Optional(
        Type.String({
            description: 'Start date of the tournament in fuzzy format',
        })
    ),
    league: Type.Optional(
        Type.String({ description: 'League of the tournament' })
    ),
    region: Type.Optional(
        Type.String({ description: 'Region of the tournament' })
    ),
    prizePool: Type.Optional(
        Type.String({ description: 'Prize pool of the tournament' })
    ),
    prizePoolCurrency: Type.Optional(
        Type.String({ description: 'Currency of the prize pool' })
    ),
    country: Type.Optional(
        Type.String({ description: 'Country of the tournament' })
    ),
    closestTimezone: Type.Optional(
        Type.String({ description: 'Closest timezone of the tournament' })
    ),
    rulebook: Type.Optional(
        Type.String({ description: 'Rulebook of the tournament' })
    ),
    eventType: Type.Optional(
        Type.String({ description: 'Type of the tournament' })
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
    year: Type.Optional(Type.String({ description: 'Year of the tournament' })),
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

const TournamentStandingsResponse = Type.Object({
    id: Type.Number({ description: 'Unique identifier for the standings' }),
    overviewPage: Type.Optional(
        Type.String({ description: 'Overview page of the tournament' })
    ),
    team: Type.Optional(Type.String({ description: 'Team name' })),
    pageAndTeam: Type.Optional(Type.String({ description: 'Page and team' })),
    n: Type.Optional(Type.Number({ description: 'N of the team' })),
    place: Type.Optional(Type.Number({ description: 'Place of the team' })),
    winSeries: Type.Optional(
        Type.Number({ description: 'Win series of the team' })
    ),
    lossSeries: Type.Optional(
        Type.Number({ description: 'Loss series of the team' })
    ),
    tieSeries: Type.Optional(
        Type.Number({ description: 'Tie series of the team' })
    ),
    winGames: Type.Optional(
        Type.Number({ description: 'Win games of the team' })
    ),
    lossGames: Type.Optional(
        Type.Number({ description: 'Loss games of the team' })
    ),
    points: Type.Optional(Type.Number({ description: 'Points of the team' })),
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
})

const TournamentGamesListResponse = Type.Object({
    id: Type.Number({ description: 'Unique identifier for the game' }),
})

const TournamentListResponse = Type.Array(TournamentSchema)
const TournamentStandingsListResponse = Type.Array(TournamentStandingsResponse)
export {
    TournamentSchema,
    TournamentListResponse,
    TournamentStandingsResponse,
    TournamentStandingsListResponse,
}
