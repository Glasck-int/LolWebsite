import { FastifyInstance } from 'fastify'
import { registerSwagger } from './swagger'
import { registerCors } from './cors'
import { registerStatic } from './static'
import { registerMetrics } from './metrics'
import { registerRedis } from './redis'

/**
 * Register all application plugins
 *
 * Centralizes plugin registration for better organization and dependency management
 *
 * @param fastify - Fastify instance to register plugins on
 */
export async function registerPlugins(fastify: FastifyInstance) {
    // Order matters for some plugins
    await registerRedis(fastify)
    await registerMetrics(fastify)
    await registerSwagger(fastify)
    await registerStatic(fastify)
    await registerCors(fastify)
}
