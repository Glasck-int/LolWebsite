import { useState, useEffect } from 'react'
import type { SeasonData } from '@/store/tableEntityStore'
import { useTableEntityStore } from '@/store/tableEntityStore'
import { getSeasonsByLeagueId } from '@/lib/api/seasons'
import type { SeasonResponse } from '@glasck-int/glasck-types'

/**
 * Hook pour récupérer automatiquement les données de saisons depuis l'API
 * et les formater pour le composant TableEntityLayout
 * 
 * @param leagueId - ID de la league pour récupérer les données
 * @returns { data: SeasonData[] | null, loading: boolean, error: string | null }
 * 
 * @example
 * const { data: seasons, loading, error } = useTableEntityData(1)
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
export const useTableEntityData = (leagueId: number) => {
    const getCachedSeasons = useTableEntityStore(state => state.getCachedSeasons)
    const setCachedSeasons = useTableEntityStore(state => state.setCachedSeasons)
    const setSeasonsLoading = useTableEntityStore(state => state.setSeasonsLoading)
    const setSeasonsError = useTableEntityStore(state => state.setSeasonsError)
    
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            if (!leagueId) {
                setSeasonsError(leagueId, 'League ID is required')
                return
            }

            const cached = getCachedSeasons(leagueId)
            if (cached && !cached.loading && cached.data && cached.data.length > 0) {
                setInitialized(true)
                return
            }

            try {
                setSeasonsLoading(leagueId, true)
                setSeasonsError(leagueId, null)
                
                const response = await getSeasonsByLeagueId(leagueId)
                
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
                setCachedSeasons(leagueId, seasons)
                
            } catch (err) {
                console.error('Error fetching season data:', err)
                setSeasonsError(leagueId, err instanceof Error ? err.message : 'Failed to fetch data')
            }
            
            setInitialized(true)
        }

        if (!initialized) {
            fetchData()
        }
    }, [leagueId, initialized, getCachedSeasons, setCachedSeasons, setSeasonsLoading, setSeasonsError])

    // Récupérer les données du cache
    const cached = getCachedSeasons(leagueId)
    
    return {
        data: cached?.data || null,
        loading: cached?.loading || false,
        error: cached?.error || null
    }
}