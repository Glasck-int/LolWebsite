import { FastifyInstance } from 'fastify'
import fastifyStatic from '@fastify/static'
import path from 'path'

/**
 * Register static files plugin
 *
 * Serves static files from the public directory
 *
 * @param fastify - Fastify instance to register the plugin on
 */
export async function registerStatic(fastify: FastifyInstance) {
    await fastify.register(fastifyStatic, {
        root: path.join(__dirname, '../../../public'),
        prefix: '/static/',
    })
}
