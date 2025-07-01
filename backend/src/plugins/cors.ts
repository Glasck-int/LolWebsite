import { FastifyInstance } from 'fastify'
import config from '../config/environment'

/**
 * Register CORS plugin
 *
 * Configures Cross-Origin Resource Sharing for the application
 *
 * @param fastify - Fastify instance to register the plugin on
 */
export async function registerCors(fastify: FastifyInstance) {
    await fastify.register(require('@fastify/cors'), {
        origin: config.isDevelopment
            ? ['http://localhost:3000', 'http://127.0.0.1:3000'] // Frontend Next.js
            : config.LOCALE_CORS
            ? [config.LOCALE_CORS]
            : [],
        credentials: true,
    })
}
