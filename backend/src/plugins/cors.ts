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
            ? [
                  'http://localhost:3000',
                  'http://127.0.0.1:3000',
                  'http://localhost:3001',
                  'http://127.0.0.1:3001',
                  'http://localhost:3002',
                  'http://127.0.0.1:3002',
                  'http://localhost:3003',
                  'http://127.0.0.1:3003',
                  'http://localhost:3004',
                  'http://127.0.0.1:3004',
                  'http://localhost:3005',
                  'http://127.0.0.1:3005',
              ] // Frontend Next.js - expanded port range
            : config.LOCALE_CORS
            ? [config.LOCALE_CORS]
            : [],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
}
