import { useState, useEffect } from 'react'
import type { SeasonData } from '@/store/tableEntityStore'
import { useTableEntityStore } from '@/store/tableEntityStore'
import { getSeasonsByLeagueId } from '@/lib/api/seasons'
import type { SeasonResponse } from '@Glasck-int/glasck-types'

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
    const setCacheLoading = useTableEntityStore(state => state.setCacheLoading)
    const setCacheError = useTableEntityStore(state => state.setCacheError)
    
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            if (!leagueId) {
                setCacheError(leagueId, 'League ID is required')
                return
            }

            // Vérifier le cache d'abord
            const cached = getCachedSeasons(leagueId)
            if (cached && !cached.loading && cached.data.length > 0) {
                // Données en cache et valides, pas besoin de fetch
                setInitialized(true)
                return
            }

            try {
                setCacheLoading(leagueId, true)
                setCacheError(leagueId, null)
                
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
                setCacheError(leagueId, err instanceof Error ? err.message : 'Failed to fetch data')
            }
            
            setInitialized(true)
        }

        if (!initialized) {
            fetchData()
        }
    }, [leagueId, initialized, getCachedSeasons, setCachedSeasons, setCacheLoading, setCacheError])

    // Récupérer les données du cache
    const cached = getCachedSeasons(leagueId)
    
    return {
        data: cached?.data || null,
        loading: cached?.loading || false,
        error: cached?.error || null
    }
}