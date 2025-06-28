import { FastifyInstance } from 'fastify'
import leaguesRoutes from './leagues/leagues'

/**
 * Register all application routes
 *
 * Centralizes route registration for better organization
 *
 * @param fastify - Fastify instance to register routes on
 */
export default async function registerRoutes(fastify: FastifyInstance) {
    // Register routes with /api prefix
    await fastify.register(leaguesRoutes, { prefix: '/api' })

    // Add more route modules here as needed
    // await fastify.register(authRoutes, { prefix: '/api' });
    // await fastify.register(productRoutes, { prefix: '/api' });
}
