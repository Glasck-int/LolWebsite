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
    if (config.isProduction) {
        await fastify.register(fastifyRedis, {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            db: parseInt(process.env.REDIS_DB || '0'),
            family: 4,
        })
    } else {
        // Mock Redis for development
        fastify.decorate('redis', {
            get: async () => null,
            setex: async () => 'OK',
            set: async () => 'OK',
            del: async () => 1,
            ping: async () => 'PONG',
        } as any)
    }
}
