import { PlayerTableEntityClient } from "@/components/players/PlayerTableEntityClient"
import { getPlayerByLink, getPlayerByOverviewPage } from '@/lib/api/player'
import { PlayerWithRedirects } from '@glasck-int/glasck-types'

interface PlayerPageProps {
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

function parsePlayerSlug(slug: string[], searchParams?: { tournament?: string; season?: string; split?: string }) {
    // Parse the slug array to extract player name and optional tournament info
    // Examples:
    // ['faker'] -> { playerName: 'faker' }
    // ['faker', '2025'] -> { playerName: 'faker', season: '2025' }
    // ['faker', '2025', 'spring'] -> { playerName: 'faker', season: '2025', split: 'spring' }
    // ['faker', '2025', 'spring', 'lck'] -> { playerName: 'faker', season: '2025', split: 'spring', tournament: 'lck' }
    
    const [playerName, season, split, tournament] = slug
    
    // Use URL segments first, then fall back to query parameters for backward compatibility
    return {
        playerName: playerName ? decodeURIComponent(playerName) : '',
        season: season || searchParams?.season || undefined,
        split: split || searchParams?.split || undefined,
        tournament: tournament || searchParams?.tournament || undefined
    }
}

export default async function PlayerPage({ params, searchParams }: PlayerPageProps) {
    const { slug } = await params
    const searchParamsResolved = await searchParams
    const { playerName, season, split, tournament } = parsePlayerSlug(slug, searchParamsResolved)
    
    // Fetch player data server-side for SEO
    let playerData: PlayerWithRedirects | null = null
    const playerImage = null // Images handled client-side like other components
    
    try {
        // First, search for the player to get the overviewPage
        const searchResult = await getPlayerByLink(playerName)
        
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
                playerName={playerName}
                playerData={playerData || undefined}
                playerImage={playerImage || undefined}
                initialSeason={season}
                initialSplit={split}
                initialTournament={tournament}
            />
        </div>
    )
}

export async function generateMetadata({ params, searchParams }: PlayerPageProps) {
    const { slug } = await params
    const searchParamsResolved = await searchParams
    const { playerName } = parsePlayerSlug(slug, searchParamsResolved)
    
    return {
        title: `${playerName} - Player Profile`,
        description: `View statistics, match history, and career information for ${playerName}`
    }
}