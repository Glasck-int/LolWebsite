import { FastifyInstance } from 'fastify'

import { TournamentListResponse } from '../../schemas/tournaments'
import { ErrorResponseSchema } from '../../schemas/common'
import prisma from '../../services/prisma'

export default async function tournamentsRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis
    const customMetric = new fastify.metrics.client.Counter({
        name: 'tournaments_by_league_name',
        help: 'Tournaments by league name',
        labelNames: ['operation'],
    })

    fastify.get<{ Params: { leagueName: string } }>(
        '/tournaments/league/:leagueName',
        {
            schema: {
                description: 'Get tournaments by league id',
                tags: ['tournaments'],
                response: {
                    200: TournamentListResponse,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { leagueName } = request.params
                const cacheKey = `tournaments:league:${leagueName}`
                customMetric.inc({
                    operation: 'get_tournaments_by_league_name',
                })
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // console.log(leagueName)
                const tournaments = await prisma.tournament.findMany({
                    where: {
                        league: leagueName,
                    },
                    orderBy: { dateStart: 'desc' },
                })
                // console.log(tournaments)
                if (tournaments.length === 0) {
                    return reply.status(404).send({ error: 'No tournaments found' })
                }


                // Cache for 1 day (86400 seconds)
                await redis.setex(cacheKey, 86400, JSON.stringify(tournaments))
                return tournaments
            } catch (error) {
                console.error(error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )
}
