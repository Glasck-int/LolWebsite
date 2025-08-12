import { Metadata } from 'next'
import { getTeamByName } from '@/lib/api/teams'
import { getSeasonsByTeamName } from '@/lib/api/seasons'

interface TeamMetadataParams {
    teamName: string
}

export const generateTeamMetadata = async ({ 
    teamName 
}: TeamMetadataParams): Promise<Metadata> => {
    try {
        const [team, seasonsResult] = await Promise.all([
            getTeamByName(teamName),
            getSeasonsByTeamName(teamName).catch(() => ({ data: [] }))
        ])
        
        if (team.error || !team.data) {
            return {
                title: 'League of Legends Esports Team',
                description: 'Professional League of Legends team statistics and tournament history',
                robots: {
                    index: false,
                    follow: false
                }
            }
        }
        
        const teamData = team.data
        const teamDisplayName = teamData.name || teamName
        const shortName = teamData.short || ''
        const region = teamData.region || ''
        const location = teamData.location || ''
        const totalTournaments = seasonsResult.data?.reduce((acc, season) => 
            acc + season.data.reduce((seasonAcc, split) => seasonAcc + (split.tournaments?.length || 0), 0), 0
        ) || 0
        
        const titleParts = [teamDisplayName]
        if (shortName && shortName !== teamDisplayName) {
            titleParts.push(`(${shortName})`)
        }
        if (region) {
            titleParts.push(region)
        }
        titleParts.push('League of Legends Esports Team | Glasck')
        const title = titleParts.join(' - ')
        
        const descriptionParts = [
            `${teamDisplayName} professional League of Legends esports team.`
        ]
        if (region && location) {
            descriptionParts.push(`Based in ${location}, competing in ${region}.`)
        } else if (region) {
            descriptionParts.push(`Competing in ${region}.`)
        } else if (location) {
            descriptionParts.push(`Based in ${location}.`)
        }
        if (totalTournaments > 0) {
            descriptionParts.push(`Tournament history across ${totalTournaments} competitions.`)
        }
        descriptionParts.push('View team statistics, match results, and roster information.')
        
        const description = descriptionParts.join(' ')
        
        const keywords = [
            'League of Legends',
            'esports',
            'professional team',
            teamDisplayName,
            'team statistics',
            'tournament history',
            'competitive gaming',
            'esports roster'
        ]
        
        // Add short name
        if (shortName && shortName !== teamDisplayName) {
            keywords.push(shortName)
        }
        
        // Add region-specific keywords
        if (region) {
            keywords.push(region, `${region} esports`)
        }
        
        // Add location keywords
        if (location && location !== region) {
            keywords.push(location)
        }
        
        return {
            title: {
                default: title,
                template: `%s - ${teamDisplayName} | Glasck`
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
                        alt: `${teamDisplayName} Logo`
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
                canonical: `/teams/${teamName}`,
                languages: {
                    'en-US': `/en/teams/${teamName}`,
                    'fr-FR': `/fr/teams/${teamName}`
                }
            },
            icons: {
                icon: '/favicon.ico',
                shortcut: '/favicon.ico',
                apple: '/favicon.ico'
            },
            manifest: '/manifest.json',
            other: {
                'team-name': teamDisplayName,
                'team-short': shortName,
                'team-region': region,
                'team-location': location,
                'tournaments-count': totalTournaments.toString()
            }
        } as Metadata
    } catch (error) {
        console.error('Error generating team metadata:', error)
        return {
            title: 'League of Legends Esports Team',
            description: 'Professional League of Legends team statistics and tournament history',
            robots: {
                index: false,
                follow: false
            }
        }
    }
}