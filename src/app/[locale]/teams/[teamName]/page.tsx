import { TeamTableEntityClient } from '@/components/teams/TeamTableEntityClient'
import { Metadata } from 'next'

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
    
    return (
        <div className="">
            <TeamTableEntityClient teamName={decodedTeamName} />
        </div>
    )
}