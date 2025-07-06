import { FastifyInstance } from 'fastify'
import { TeamSchema } from '../../schemas/teams'
import { ErrorResponseSchema } from '../../schemas/common'
import prisma from '../../services/prisma'

export default async function teamsRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis
    const customMetric = new fastify.metrics.client.Counter({
        name: 'teams_by_name',
        help: 'Teams by name',
        labelNames: ['operation'],
    })

    fastify.get<{ Params: { name: string } }>(
        '/teams/name/:name',
        {
            schema: {
                description: 'Get a team by name',
                tags: ['teams'],
                response: {
                    200: TeamSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { name } = request.params
            const cacheKey = `team:name:${name}`
            customMetric.inc({ operation: 'get_team_by_name' })
            const cached = await redis.get(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }
            const team = await prisma.team.findUnique({
                where: { overviewPage: name },
            })

            if (!team) {
                return reply.status(404).send({ error: 'Team not found' })
            }

            // Cache for 1 week (604800 seconds)
            await redis.setex(cacheKey, 604800, JSON.stringify(team))
            return team
        }
    )
}
