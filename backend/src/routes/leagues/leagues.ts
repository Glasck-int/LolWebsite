import { FastifyInstance } from 'fastify'
import { LeagueSchema, LeagueListResponse } from '../../schemas/league'
import { MatchScheduleListResponse } from '../../schemas/matchShedule'
import { ErrorResponseSchema } from '../../schemas/common'
import prisma from '../../services/prisma'

/**
 * Register leagues routes
 *
 * @param fastify - Fastify instance to register routes on
 */
export default async function leaguesRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis
    // Créer une métrique custom en utilisant le client intégré
    const customMetric = new fastify.metrics.client.Counter({
        name: 'leagues_by_league_id',
        help: 'Leagues by league id',
        labelNames: ['operation'],
    })

    fastify.get(
        '/leagues',
        {
            schema: {
                description: 'Get all leagues',
                tags: ['leagues'],
                response: {
                    200: LeagueListResponse,
                    500: ErrorResponseSchema,
                },
            },
        },
        async () => {
            const cacheKey = 'leagues:all'
            customMetric.inc({ operation: 'get_leagues' })
            const cached = await redis.get(cacheKey)

            if (cached) {
                return JSON.parse(cached)
            }

            const leagues = await prisma.league.findMany()

            // Cache for 1 day (86400 seconds)
            await redis.setex(cacheKey, 86400, JSON.stringify(leagues))

            return leagues
        }
    )

    fastify.get(
        '/leagues/major',
        {
            schema: {
                description: 'Get all major leagues',
                tags: ['leagues'],
                response: {
                    200: LeagueListResponse,
                    500: ErrorResponseSchema,
                },
            },
        },
        async () => {
            const cacheKey = 'leagues:major'
            customMetric.inc({ operation: 'get_major_leagues' })
            const cached = await redis.get(cacheKey)

            if (cached) {
                return JSON.parse(cached)
            }

            const leagues = await prisma.league.findMany({
                where: { isMajor: true },
            })

            // Cache for 1 day (86400 seconds)
            await redis.setex(cacheKey, 86400, JSON.stringify(leagues))

            return leagues
        }
    )

    fastify.get<{ Params: { slug: string } }>(
        '/leagues/slug/:slug',
        {
            schema: {
                description:
                    'Get a league by slug (note :modify the findfirst to find unique when database ok)',
                tags: ['leagues'],
                response: {
                    200: LeagueSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const cacheKey = `league:slug:${request.params.slug}`
            customMetric.inc({ operation: 'get_league_by_slug' })
            const cached = await redis.get(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }

            const { slug } = request.params
            const league = await prisma.league.findFirst({
                where: { slug },
            })

            // Cache for 1 week (604800 seconds)
            await redis.setex(cacheKey, 604800, JSON.stringify(league))

            if (!league) {
                return reply.status(404).send({ error: 'League not found' })
            }

            return league
        }
    )

    fastify.get<{ Params: { id: string } }>(
        '/leagues/id/:id/next-matches',
        {
            schema: {
                description: 'Get the next three matches for a league by ID',
                tags: ['leagues'],
                response: {
                    200: MatchScheduleListResponse,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const cacheKey = `league:next-matches:${request.params.id}`
            customMetric.inc({ operation: 'get_league_next_matches' })
            const cached = await redis.get(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }

            const { id } = request.params
            const leagueId = Number(id)

            if (isNaN(leagueId)) {
                return reply.status(400).send({ error: 'Invalid league ID' })
            }

            // Get the league to verify it exists
            const league = await prisma.league.findUnique({
                where: { id: leagueId },
            })

            if (!league) {
                return reply.status(404).send({ error: 'League not found' })
            }

            // Get tournaments for this league
            const tournaments = await prisma.tournament.findMany({
                where: { league: league.name },
                select: { overviewPage: true },
            })

            if (tournaments.length === 0) {
                return []
            }

            const tournamentPages = tournaments.map((t) => t.overviewPage)

            // Get next matches from all tournaments of this league
            const nextMatches = await prisma.matchSchedule.findMany({
                where: {
                    overviewPage: { in: tournamentPages },
                    dateTime_UTC: {
                        gte: new Date(), // Only future matches
                    },
                },
                select: {
                    id: true,
                    team1: true,
                    team2: true,
                    dateTime_UTC: true,
                    overviewPage: true,
                    round: true,
                    bestOf: true,
                },
                orderBy: {
                    dateTime_UTC: 'asc',
                },
                take: 3, // Limit to 3 matches
            })

            // Cache for 1 hour (3600 seconds) since match schedules change frequently
            await redis.setex(cacheKey, 3600, JSON.stringify(nextMatches))

            return nextMatches
        }
    )

    fastify.get<{ Params: { id: string } }>(
        '/leagues/id/:id',
        {
            schema: {
                description: 'Get a league by id',
                tags: ['leagues'],
                response: {
                    200: LeagueSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const cacheKey = `league:id:${request.params.id}`
            customMetric.inc({ operation: 'get_league_by_id' })
            const cached = await redis.get(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }

            const { id } = request.params
            const leagueId = Number(id)

            if (isNaN(leagueId)) {
                return reply.status(400).send({ error: 'Invalid league ID' })
            }

            const league = await prisma.league.findUnique({
                where: { id: leagueId },
            })

            // Cache for 1 week (604800 seconds)
            await redis.setex(cacheKey, 604800, JSON.stringify(league))

            if (!league) {
                return reply.status(404).send({ error: 'League not found' })
            }

            return league
        }
    )
}
