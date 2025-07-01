import { FastifyInstance } from 'fastify'
import metricsPlugin from 'fastify-metrics'
import config from '../config/environment'

/**
 * Register metrics plugin
 *
 * Configures application metrics for monitoring in development
 *
 * @param fastify - Fastify instance to register the plugin on
 */
export async function registerMetrics(fastify: FastifyInstance) {
    if (config.isDevelopment) {
        await fastify.register(metricsPlugin, {
            endpoint: '/metrics',
            routeMetrics: {
                enabled: true,
                // Grouper les codes de statut (2xx, 3xx, 4xx, 5xx)
                groupStatusCodes: true,
                // Labels personnalisés
                customLabels: {
                    service: 'glasck-api',
                    version: process.env.npm_package_version || '1.0.0',
                },
                overrides: {
                    histogram: {
                        name: 'glasck_http_request_duration_seconds',
                        buckets: [0.1, 0.5, 1, 3, 5],
                    },
                    summary: {
                        help: 'Request duration in seconds summary for Glasck API',
                        labelNames: ['status_code', 'method', 'route'],
                        percentiles: [0.5, 0.75, 0.9, 0.95, 0.99],
                    },
                },
            },
        })
    }
}
