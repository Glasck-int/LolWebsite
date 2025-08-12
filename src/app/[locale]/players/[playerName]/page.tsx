import { PlayerTableEntityClient } from "@/components/players/PlayerTableEntityClient"
import { getPlayerByLink, getPlayerByOverviewPage } from '@/lib/api/player'
import { PlayerWithRedirects } from '@glasck-int/glasck-types'

interface PlayerPageProps {
    params: Promise<{
        playerName: string
    }>
}

export default async function PlayerPage({ params }: PlayerPageProps) {
    const { playerName } = await params
    const decodedPlayerName = decodeURIComponent(playerName)
    
    // Fetch player data server-side for SEO
    let playerData: PlayerWithRedirects | null = null
    const playerImage = null // Images handled client-side like other components
    
    try {
        // First, search for the player to get the overviewPage
        const searchResult = await getPlayerByLink(decodedPlayerName)
        
        if (searchResult.data && searchResult.data.length > 0) {
            // Get the overviewPage from the first result
            const overviewPage = searchResult.data[0].overviewPage
            
            // Now get the complete player data
            const playerDataResult = await getPlayerByOverviewPage(overviewPage)
            
            if (playerDataResult.data) {
                playerData = playerDataResult.data
                
                // Player images will be handled client-side like other components
                // This allows access to selectedTournamentId for tournament-specific images
            }
        }
    } catch (error) {
        console.error('Error fetching player data on server:', error)
    }
    
    return (
        <div className="">
            <PlayerTableEntityClient 
                playerName={decodedPlayerName}
                playerData={playerData || undefined}
                playerImage={playerImage || undefined}
            />
        </div>
    )
}

export async function generateMetadata({ params }: PlayerPageProps) {
    const { playerName } = await params
    const decodedPlayerName = decodeURIComponent(playerName)
    
    return {
        title: `${decodedPlayerName} - Player Profile`,
        description: `View statistics, match history, and career information for ${decodedPlayerName}`
    }
}