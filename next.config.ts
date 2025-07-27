import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '3001',
                pathname: '/static/**',
            },
            {
                protocol: 'https',
                hostname: '127.0.0.1',
                port: '3001',
                pathname: '/static/**',
            },
            {
                protocol: 'http',
                hostname: '49.13.26.198',
                port: '3001',
                pathname: '/static/**',
            },
        ],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
