import { FastifyInstance } from 'fastify'
import { fastifyRedis } from '@fastify/redis'
import config from '../config/environment'

/**
 * Register Redis plugin
 *
 * Configures Redis caching for the application with fallback for development
 *
 * @param fastify - Fastify instance to register the plugin on
 */
export async function registerRedis(fastify: FastifyInstance) {
    // Only try to register Redis in production
    if (!config.isProduction) {
        await fastify.register(fastifyRedis, {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0'),
            family: 4,
        })
    }
}
