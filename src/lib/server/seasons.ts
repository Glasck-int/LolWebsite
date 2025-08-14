import { getSeasonsByLeagueId } from '@/lib/api/seasons'
import type { SeasonData } from '@/store/tableEntityStore'
import type { SeasonResponse } from '@glasck-int/glasck-types'

/**
 * Server-side function to fetch seasons data by league ID
 * 
 * @param leagueId - ID of the league to fetch seasons for
 * @returns Promise with seasons data or null if error
 */
export async function getSeasonsByLeagueIdServer(leagueId: number): Promise<SeasonData[] | null> {
    try {
        const response = await getSeasonsByLeagueId(leagueId)
        
        if (response.error) {
            console.error('Error fetching seasons:', response.error)
            return null
        }
        
        if (!response.data) {
            console.error('No data received from API')
            return null
        }
        
        // Convertir les données API au format SeasonData
        const seasons: SeasonData[] = response.data.map((season: SeasonResponse) => ({
            season: season.season,
            data: season.data.map(split => ({
                split: split.split,
                tournaments: split.tournaments
            }))
        }))
        
        return seasons
    } catch (error) {
        console.error('Server error fetching seasons:', error)
        return null
    }
}