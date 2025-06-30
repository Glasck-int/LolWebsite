import { FastifyInstance } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import {
    LeagueSchema,
    CreateLeagueSchema,
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
        name: 'custom_business_metric',
        help: 'Custom business logic metric for Glasck API',
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
}
