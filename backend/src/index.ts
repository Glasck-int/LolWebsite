import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import path from 'path'
import registerRoutes from './routes'

/**
 * Fastify application instance
 * 
 * Main server instance configured with plugins and middleware
 */
const app = fastify()

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

// Serve static files
app.register(fastifyStatic, {
    root: path.join(__dirname, '../../public'),
    prefix: '/static/',
})

// CORS pour toute l'équipe
app.register(require('@fastify/cors'), {
    origin: process.env.LOCALE_CORS ? [process.env.LOCALE_CORS] : [],
    credentials: true,
})

/**
 * Start the Fastify server
 * 
 * Initializes the application by registering routes and starting the server
 * on the configured port and host
 * 
 * @returns Promise<void>
 * 
 * @throws Error - When server fails to start or route registration fails
 * 
 * @example
 * ```ts
 * await start();
 * // Server is now listening on configured port
 * ```
 * 
 * @remarks
 * Server listens on all interfaces (0.0.0.0) and uses environment variable
 * PORT or defaults to 3001
 */
const start = async () => {
    await registerRoutes(app)

    const PORT = parseInt(process.env.PORT || '3001', 10)
    const HOST = '0.0.0.0'
    app.listen({ port: PORT, host: HOST })
}

start().catch(console.error)
