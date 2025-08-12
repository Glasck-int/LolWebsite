import { useState, useEffect } from 'react'
import type { SeasonData } from '@/store/tableEntityStore'
import { useTableEntityStore } from '@/store/tableEntityStore'
import { getSeasonsByPlayerName } from '@/lib/api/seasons'
import type { SeasonResponse } from '@glasck-int/glasck-types'

/**
 * Hook pour récupérer automatiquement les données de saisons depuis l'API pour un joueur
 * et les formater pour le composant TableEntityLayout
 * 
 * @param playerName - Nom du joueur pour récupérer les données
 * @returns { data: SeasonData[] | null, loading: boolean, error: string | null }
 * 
 * @example
 * const { data: seasons, loading, error } = usePlayerTableEntityData("Faker")
 * 
 * if (loading) return <div>Loading...</div>
 * if (error) return <div>Error: {error}</div>
 * if (!seasons) return <div>No data</div>
 * 
 * return (
 *   <TableEntityLayout>
 *     <TableEntityHeader seasons={seasons} all={[0, 1]} />
 *   </TableEntityLayout>
 * )
 */
export const usePlayerTableEntityData = (playerName: string) => {
    const getCachedSeasons = useTableEntityStore(state => state.getCachedSeasons)
    const setCachedSeasons = useTableEntityStore(state => state.setCachedSeasons)
    const setSeasonsLoading = useTableEntityStore(state => state.setSeasonsLoading)
    const setSeasonsError = useTableEntityStore(state => state.setSeasonsError)
    
    const [initialized, setInitialized] = useState(false)

    // Use a negative number as cache key to avoid collision with league IDs
    // Hash the player name to get a consistent negative number
    const cacheKey = -(playerName.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0))

    useEffect(() => {
        const fetchData = async () => {
            if (!playerName) {
                setSeasonsError(cacheKey, 'Player name is required')
                return
            }

            const cached = getCachedSeasons(cacheKey)
            if (cached && !cached.loading && cached.data && cached.data.length > 0) {
                setInitialized(true)
                return
            }

            try {
                setSeasonsLoading(cacheKey, true)
                setSeasonsError(cacheKey, null)
                
                const response = await getSeasonsByPlayerName(playerName)
                
                if (response.error) {
                    throw new Error(response.error)
                }
                
                if (!response.data) {
                    throw new Error('No data received from API')
                }
                
                // Convertir les données API au format SeasonData
                const seasons: SeasonData[] = response.data.map((season: SeasonResponse) => ({
                    season: season.season,
                    data: season.data.map(split => ({
                        split: split.split,
                        tournaments: split.tournaments
                    }))
                }))
                
                // Stocker dans le cache
                setCachedSeasons(cacheKey, seasons)
                
            } catch (err) {
                console.error('Error fetching player season data:', err)
                setSeasonsError(cacheKey, err instanceof Error ? err.message : 'Failed to fetch data')
            }
            
            setInitialized(true)
        }

        if (!initialized) {
            fetchData()
        }
    }, [playerName, initialized, cacheKey, getCachedSeasons, setCachedSeasons, setSeasonsLoading, setSeasonsError])

    // Récupérer les données du cache
    const cached = getCachedSeasons(cacheKey)
    
    return {
        data: cached?.data || null,
        loading: cached?.loading || false,
        error: cached?.error || null
    }
}