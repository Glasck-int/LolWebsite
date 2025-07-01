import { FastifyInstance } from 'fastify'
import {
    LeagueSchema,
    LeagueListResponse,
} from '../../schemas/league'
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
