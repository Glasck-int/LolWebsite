import { TeamTableEntityClient } from '@/components/teams/TeamTableEntityClient'
import { Metadata } from 'next'
import { getTeamByName } from '@/lib/api/teams'
import { getTeamImage, getTeamImageByName } from '@/lib/api/image'
import { TeamWithLatestLeague } from '@/lib/types/team'

interface TeamPageProps {
    params: Promise<{
        slug: string[]
        locale: string
    }>
    searchParams: Promise<{
        tournament?: string
        season?: string
        split?: string
    }>
}

function parseTeamSlug(slug: string[], searchParams?: { tournament?: string; season?: string; split?: string }) {
    // Parse the slug array to extract team name and optional tournament info
    // Examples:
    // ['dn-freecs'] -> { teamName: 'dn-freecs' }
    // ['dn-freecs', '2025'] -> { teamName: 'dn-freecs', season: '2025' }
    // ['dn-freecs', '2025', 'spring'] -> { teamName: 'dn-freecs', season: '2025', split: 'spring' }
    // ['dn-freecs', '2025', 'spring', 'lck'] -> { teamName: 'dn-freecs', season: '2025', split: 'spring', tournament: 'lck' }
    
    const [teamName, season, split, tournament] = slug
    
    // Use URL segments first, then fall back to query parameters for backward compatibility
    return {
        teamName: teamName ? decodeURIComponent(teamName) : '',
        season: season || searchParams?.season || undefined,
        split: split || searchParams?.split || undefined,
        tournament: tournament || searchParams?.tournament || undefined
    }
}

// ISR Configuration - Mixed cache strategy for team pages
export const revalidate = 300 // 5 minutes base revalidation

export async function generateMetadata({ params, searchParams }: TeamPageProps): Promise<Metadata> {
    const { slug } = await params
    const searchParamsResolved = await searchParams
    const { teamName } = parseTeamSlug(slug, searchParamsResolved)
    
    return {
        title: `${teamName} - Team Profile`,
        description: `View detailed tournament history, statistics, and matches for ${teamName}`,
    }
}

export default async function TeamPage({ params, searchParams }: TeamPageProps) {
    const { slug } = await params
    const searchParamsResolved = await searchParams
    const { teamName, season, split, tournament } = parseTeamSlug(slug, searchParamsResolved)
    
    // Fetch team data server-side for SEO
    let teamData: TeamWithLatestLeague | null = null
    let teamImage = null
    let leagueData = null
    
    try {
        const teamResult = await getTeamByName(teamName)
        
        if (teamResult.data) {
            teamData = teamResult.data as TeamWithLatestLeague
            
            // Try to get team image from the team's image field first
            if (teamData.image) {
                const teamImageResult = await getTeamImage(teamData.image.replace('.png', '.webp'))
                if (teamImageResult.data) {
                    teamImage = teamImageResult.data
                }
            }
            
            // Fallback to image by name if no image found
            if (!teamImage && teamData.overviewPage) {
                const teamImageByNameResult = await getTeamImageByName(teamData.overviewPage)
                if (teamImageByNameResult.data) {
                    teamImage = teamImageByNameResult.data
                }
            }
            
            // Use the latest league data from the team API (now included)
            if (teamData.latestLeague) {
                leagueData = teamData.latestLeague
            }
        }
    } catch (error) {
        console.error('Error fetching team data on server:', error)
    }

    return (
        <div>
            <TeamTableEntityClient 
                teamName={teamName}
                teamData={teamData || undefined}
                teamImage={teamImage || undefined}
                leagueData={leagueData || undefined}
                initialSeason={season}
                initialSplit={split}
                initialTournament={tournament}
            />
        </div>
    )
}