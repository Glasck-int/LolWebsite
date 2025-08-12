import { getAllLeagues, getMajorLeagues } from '@/lib/api/league'
import { Metadata } from 'next'



export const generateMetadata = async () => {
        const [allLeaguesResponse, majorLeaguesResponse] = await Promise.all([
            getAllLeagues(),
            getMajorLeagues(),
        ])
    return {
        title: {
            default: `Leagues`,
            template: `%s - Leagues (${allLeaguesResponse.data?.length} leagues, ${majorLeaguesResponse.data?.length} major leagues)`,
        },
        description: `All ${allLeaguesResponse.data?.length} leagues from League of Legends Esport scene.`,
        icons: {
            icon: '/favicon.ico',
        },
        manifest: '/manifest.json',
        openGraph: {
            type: 'website',
            title: 'Glasck.com',
            description: `All ${allLeaguesResponse.data?.length} leagues from League of Legends Esport scene.`,
            images: ['/favicon.ico'],
            siteName: 'Glasck.com',
        },
        twitter: {
            card: 'summary_large_image',
            site: '@glasck',
            creator: '@glasck',
        },
        metadataBase: new URL('https://glasck.com'),
        alternates: {
            canonical: 'https://glasck.com',
            languages: {
                'en-US': 'https://glasck.com/en',
                'fr-FR': 'https://glasck.com/fr',
            },
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
            },
        },
    } as Metadata
}