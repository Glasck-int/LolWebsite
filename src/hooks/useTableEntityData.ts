import { useState, useEffect } from 'react'
import type { SeasonData } from '@/components/layout/TableEntityLayout/TableEntityLayout'
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
    const [data, setData] = useState<SeasonData[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!leagueId) {
                setError('League ID is required')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                
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
                
                setData(seasons)
                
            } catch (err) {
                console.error('Error fetching season data:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch data')
                setData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [leagueId])

    return { data, loading, error }
}