/**
 * Application entry point
 *
 * Starts the Fastify server with all configured plugins and routes
 */
import { startServer } from './server'

startServer().catch(console.error)
