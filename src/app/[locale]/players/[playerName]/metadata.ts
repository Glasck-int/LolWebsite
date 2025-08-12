import { Metadata } from 'next'
import { getPlayerByLink, getPlayerByOverviewPage } from '@/lib/api/player'
import { getSeasonsByPlayerName } from '@/lib/api/seasons'

interface PlayerMetadataParams {
    playerName: string
}

export const generatePlayerMetadata = async ({ 
    playerName 
}: PlayerMetadataParams): Promise<Metadata> => {
    try {
        const [searchResult, seasonsResult] = await Promise.all([
            getPlayerByLink(playerName),
            getSeasonsByPlayerName(playerName).catch(() => ({ data: [] }))
        ])
        
        let playerData = null
        
        // If we found search results, get the full player data
        if (searchResult.data && searchResult.data.length > 0) {
            const overviewPage = searchResult.data[0].overviewPage
            const playerResult = await getPlayerByOverviewPage(overviewPage)
            playerData = playerResult.data
        }
        
        if (!playerData) {
            return {
                title: 'League of Legends Pro Player Profile',
                description: 'Professional League of Legends player statistics and career information',
                robots: {
                    index: false,
                    follow: false
                }
            }
        }
        
        const playerDisplayName = playerData.name || playerName
        const currentTeam = playerData.team || ''
        const role = playerData.role || ''
        const country = playerData.country || ''
        const region = playerData.residency || ''
        const totalTournaments = seasonsResult.data?.reduce((acc, season) => 
            acc + season.data.reduce((seasonAcc, split) => seasonAcc + (split.tournaments?.length || 0), 0), 0
        ) || 0
        
        const titleParts = [playerDisplayName]
        if (currentTeam) titleParts.push(currentTeam)
        if (role) titleParts.push(role)
        titleParts.push('League of Legends Pro Player | Glasck')
        const title = titleParts.join(' - ')
        
        const descriptionParts = [
            `${playerDisplayName} professional League of Legends player profile.`
        ]
        if (currentTeam && role) {
            descriptionParts.push(`Currently playing ${role} for ${currentTeam}.`)
        } else if (role) {
            descriptionParts.push(`Professional ${role} player.`)
        } else if (currentTeam) {
            descriptionParts.push(`Currently playing for ${currentTeam}.`)
        }
        if (totalTournaments > 0) {
            descriptionParts.push(`Career statistics across ${totalTournaments} tournaments.`)
        }
        if (country) {
            descriptionParts.push(`Representing ${country}.`)
        }
        
        const description = descriptionParts.join(' ')
        
        const keywords = [
            'League of Legends',
            'esports',
            'professional player',
            playerDisplayName,
            'player statistics',
            'tournament history',
            'competitive gaming'
        ]
        
        // Add team-specific keywords
        if (currentTeam) {
            keywords.push(currentTeam, `${currentTeam} roster`)
        }
        
        // Add role-specific keywords
        if (role) {
            keywords.push(role, `${role} player`)
        }
        
        // Add region/country keywords
        if (country) {
            keywords.push(country)
        }
        if (region && region !== country) {
            keywords.push(region)
        }
        
        return {
            title: {
                default: title,
                template: `%s - ${playerDisplayName} | Glasck`
            },
            description,
            keywords,
            authors: [{ name: 'Glasck' }],
            creator: 'Glasck',
            publisher: 'Glasck',
            openGraph: {
                title,
                description,
                type: 'profile',
                siteName: 'Glasck.com',
                locale: 'en_US',
                alternateLocale: ['fr_FR'],
                images: [
                    {
                        url: '/favicon.ico',
                        width: 32,
                        height: 32,
                        alt: `${playerDisplayName} Profile`
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
                canonical: `/players/${playerName}`,
                languages: {
                    'en-US': `/en/players/${playerName}`,
                    'fr-FR': `/fr/players/${playerName}`
                }
            },
            icons: {
                icon: '/favicon.ico',
                shortcut: '/favicon.ico',
                apple: '/favicon.ico'
            },
            manifest: '/manifest.json',
            other: {
                'player-name': playerDisplayName,
                'current-team': currentTeam,
                'player-role': role,
                'player-country': country,
                'tournaments-count': totalTournaments.toString()
            }
        } as Metadata
    } catch (error) {
        console.error('Error generating player metadata:', error)
        return {
            title: 'League of Legends Pro Player Profile',
            description: 'Professional League of Legends player statistics and career information',
            robots: {
                index: false,
                follow: false
            }
        }
    }
}