
import fastify from 'fastify'
import { registerPlugins } from './plugins'
import registerRoutes from './routes'

/**
 * Create and configure Fastify application
 *
 * Sets up the main application instance with all plugins and routes
 *
 * @returns Configured Fastify instance
 */
export async function createApp() {
    const app = fastify()

    // Register plugins first
    await registerPlugins(app)

    // Register routes last
    await registerRoutes(app)

    return app
}
