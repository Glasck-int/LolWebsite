import { FastifyInstance } from 'fastify'
import prisma from '../../services/prisma'

/**
 * Register leagues routes
 *
 * @param fastify - Fastify instance to register routes on
 */
export default async function leaguesRoutes(fastify: FastifyInstance) {
    fastify.get('/leagues', async () => {
        const leagues = await prisma.league.findMany()
        console.log(leagues.length, 'leagues found')
        return leagues
    })
}
