import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Environment configuration
 *
 * Centralizes all environment variable access with proper typing and defaults
 */
export const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3001', 10),
    HOST: process.env.HOST || 'localhost:3001',
    LOCALE_CORS: process.env.LOCALE_CORS,
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600'), // 1 heure
} as const

export default config
