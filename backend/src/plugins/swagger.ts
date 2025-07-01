import { FastifyInstance } from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import config from '../config/environment'

/**
 * Register Swagger documentation plugin
 *
 * Configures API documentation with Swagger UI for development environments
 *
 * @param fastify - Fastify instance to register the plugin on
 */
export async function registerSwagger(fastify: FastifyInstance) {
    if (config.isDevelopment) {
        await fastify.register(swagger, {
            swagger: {
                info: {
                    title: 'Glasck API',
                    description: 'API documentation for the Glasck application',
                    version: '1.0.0',
                },
                host: config.HOST,
                schemes: ['http'],
                consumes: ['application/json'],
                produces: ['application/json'],
                tags: [
                    { name: 'Glasck', description: 'Glasck related endpoints' },
                ],
            },
        })

        await fastify.register(swaggerUi, {
            routePrefix: '/documentation',
            uiConfig: {
                docExpansion: 'full',
                deepLinking: false,
            },
        })
    }
}
