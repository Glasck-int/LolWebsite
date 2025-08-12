import { TeamTableEntityClient } from '@/components/teams/TeamTableEntityClient'
import { Metadata } from 'next'
import { getTeamByName } from '@/lib/api/teams'
import { getTeamImage, getTeamImageByName } from '@/lib/api/image'
import { TeamWithLatestLeague } from '@/lib/types/team'

interface TeamPageProps {
    params: Promise<{
        teamName: string
        locale: string
    }>
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
    const { teamName } = await params
    const decodedTeamName = decodeURIComponent(teamName)
    
    return {
        title: `${decodedTeamName} - Team Profile`,
        description: `View detailed tournament history, statistics, and matches for ${decodedTeamName}`,
    }
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { teamName } = await params
    const decodedTeamName = decodeURIComponent(teamName)
    
    // Fetch team data server-side for SEO
    let teamData: TeamWithLatestLeague | null = null
    let teamImage = null
    let leagueData = null
    
    try {
        const teamResult = await getTeamByName(decodedTeamName)
        
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
                teamName={decodedTeamName}
                teamData={teamData || undefined}
                teamImage={teamImage || undefined}
                leagueData={leagueData || undefined}
            />
        </div>
    )
}