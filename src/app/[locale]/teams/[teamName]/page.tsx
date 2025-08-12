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
            console.log('📡 [FRONTEND] Raw data from backend:', teamResult.data)
            console.log('📡 [FRONTEND] latestLeague field specifically:', teamResult.data.latestLeague)
            console.log('📡 [FRONTEND] All keys in data:', Object.keys(teamResult.data))
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
                console.log('🎯 [FRONTEND] Latest league data from team API:', teamData.latestLeague)
                leagueData = teamData.latestLeague
            }
        }
    } catch (error) {
        console.error('Error fetching team data on server:', error)
    }
    
    console.log('🚀 [FRONTEND] Passing to component:', {
        teamName: decodedTeamName,
        hasTeamData: !!teamData,
        hasLeagueData: !!leagueData,
        leagueDataShort: leagueData?.short || 'N/A',
        leagueDataName: leagueData?.name || 'N/A',
        note: 'League images now handled dynamically in component'
    })

    return (
        <div className="">
            <TeamTableEntityClient 
                teamName={decodedTeamName}
                teamData={teamData || undefined}
                teamImage={teamImage || undefined}
                leagueData={leagueData || undefined}
            />
        </div>
    )
}