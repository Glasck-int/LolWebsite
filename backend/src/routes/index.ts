import { FastifyInstance } from 'fastify'
import leaguesRoutes from './leagues/leagues'
import teamsRoutes from './teams/teams'
import tournamentsRoutes from './tournaments/tournaments'
import playersRoutes from './players/players'
import seasonsRoutes from './seasons/seasons'
import championsRoutes from './champions/champions'
/**
 * Register all application routes
 *
 * Centralizes route registration for better organization
 *
 * @param fastify - Fastify instance to register routes on
 */
async function registerRoutes(fastify: FastifyInstance) {
    // Register routes with /api prefix
    await fastify.register(leaguesRoutes, { prefix: '/api' })
    await fastify.register(tournamentsRoutes, { prefix: '/api' })
    await fastify.register(teamsRoutes, { prefix: '/api' })
    await fastify.register(playersRoutes, { prefix: '/api' })
    await fastify.register(seasonsRoutes, { prefix: '/api' })
    await fastify.register(championsRoutes, { prefix: '/api' })
    // Add more route modules here as needed
    // await fastify.register(authRoutes, { prefix: '/api' });
    // await fastify.register(productRoutes, { prefix: '/api' });
}

export default registerRoutes
