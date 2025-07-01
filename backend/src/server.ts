import { createApp } from './app'
import config from './config/environment'

/**
 * Start the Fastify server
 *
 * Initializes the application and starts the server on the configured port and host
 *
 * @returns Promise<void>
 *
 * @throws Error - When server fails to start or application initialization fails
 *
 * @example
 * ```ts
 * await startServer();
 * // Server is now listening on configured port
 * ```
 *
 * @remarks
 * Server listens on all interfaces (0.0.0.0) and uses environment variable
 * PORT or defaults to 3001
 */
export async function startServer() {
    try {
        const app = await createApp()

        await app.listen({
            port: config.PORT,
            host: '0.0.0.0',
        })

        console.log(`Server listening on ${config.HOST}`)

        return app
    } catch (error) {
        console.error('Error starting server:', error)
        process.exit(1)
    }
}

// Only start server if this file is run directly
if (require.main === module) {
    startServer().catch(console.error)
}
