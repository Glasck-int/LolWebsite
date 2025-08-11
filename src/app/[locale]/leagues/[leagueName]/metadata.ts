import { Metadata } from 'next'
import { getLeagueByName } from '@/lib/api/league'
import { getTournamentsByLeagueName } from '@/lib/api/tournaments'

interface LeagueMetadataParams {
    leagueName: string
}

export const generateLeagueMetadata = async ({ 
    leagueName 
}: LeagueMetadataParams): Promise<Metadata> => {
    try {
        const [league, tournaments] = await Promise.all([
            getLeagueByName(leagueName),
            getTournamentsByLeagueName(leagueName).catch(() => ({ data: [] }))
        ])
        
        if (league.error) {
            return {
                title: 'League of Legends Esports League',
                description: 'Competitive League of Legends league statistics and standings',
                robots: {
                    index: false,
                    follow: false
                }
            }
        }
        
        const leagueDisplayName = league.data?.name || 'League'
        const tournamentsCount = tournaments.data?.length || 0
        const region = league.data?.region || ''
        const isMajor = league.data?.isMajor || false
        const isOfficial = league.data?.isOfficial || false
        
        const title = `${leagueDisplayName} - League of Legends ${region} | Glasck`
        const description = `${leagueDisplayName} ${isMajor ? '(Major League)' : ''} standings, matches, and tournament results. Follow ${tournamentsCount > 0 ? `${tournamentsCount} tournaments` : 'live results'}, team rankings, and player statistics${region ? ` from ${region}` : ''}.`
        
        const keywords = [
            'League of Legends',
            'esports',
            leagueDisplayName,
            region,
            'tournament',
            'standings',
            'competitive gaming'
        ]
        
        // Add region-specific keywords
        if (region) {
            keywords.push(region)
        }
        
        // Add major league indicators
        if (isMajor) {
            keywords.push('major league', 'LCS', 'LEC', 'LCK', 'LPL')
        }
        
        return {
            title: {
                default: title,
                template: `%s - ${leagueDisplayName} | Glasck`
            },
            description,
            keywords,
            authors: [{ name: 'Glasck' }],
            creator: 'Glasck',
            publisher: 'Glasck',
            openGraph: {
                title,
                description,
                type: 'website',
                siteName: 'Glasck.com',
                locale: 'en_US',
                alternateLocale: ['fr_FR'],
                images: [
                    {
                        url: '/favicon.ico',
                        width: 32,
                        height: 32,
                        alt: `${leagueDisplayName} Logo`
                    }
                ]
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                site: '@glasck',
                creator: '@glasck'
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-snippet': -1,
                    'max-image-preview': 'large',
                    'max-video-preview': -1
                }
            },
            metadataBase: new URL('https://glasck.com'),
            alternates: {
                canonical: `/leagues/${leagueName}`,
                languages: {
                    'en-US': `/en/leagues/${leagueName}`,
                    'fr-FR': `/fr/leagues/${leagueName}`
                }
            },
            icons: {
                icon: '/favicon.ico',
                shortcut: '/favicon.ico',
                apple: '/favicon.ico'
            },
            manifest: '/manifest.json',
            other: {
                'league-name': leagueDisplayName,
                'league-region': region,
                'tournaments-count': tournamentsCount.toString(),
                'is-major': isMajor.toString(),
                'is-official': isOfficial.toString()
            }
        } as Metadata
    } catch (error) {
        console.error('Error generating league metadata:', error)
        return {
            title: 'League of Legends Esports League',
            description: 'Competitive League of Legends league statistics and standings',
            robots: {
                index: false,
                follow: false
            }
        }
    }
}