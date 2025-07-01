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

const TournamentListResponse = Type.Array(TournamentSchema)

export { TournamentSchema, TournamentListResponse }
