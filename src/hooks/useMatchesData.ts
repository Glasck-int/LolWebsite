import { useState, useEffect } from 'react'
import { useTableEntityStore } from '@/store/tableEntityStore'
import { getMatchesForTournament } from '@/lib/api/tournaments'
import { getTeamsByNames } from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'
import { MatchSchedule } from '@/generated/prisma'

interface NextMatchesData {
    matches: MatchSchedule[]
    teamsData: Array<{
        short?: string | null
        image?: string | null
        overviewPage?: string | null
    }>
    teamImages: Array<{
        team1Image?: string | null
        team2Image?: string | null
    }>
    lastMatches: boolean
}

/**
 * Hook pour récupérer automatiquement les données de matches depuis l'API
 * avec cache intelligent pour éviter les re-fetches
 * 
 * @param tournamentId - ID du tournoi pour récupérer les matches
 * @returns { data: NextMatchesData | null, loading: boolean, error: string | null }
 */
export const useMatchesData = (tournamentId: number | undefined) => {
    const getCachedMatches = useTableEntityStore(state => state.getCachedMatches)
    const setCachedMatches = useTableEntityStore(state => state.setCachedMatches)
    const setMatchesLoading = useTableEntityStore(state => state.setMatchesLoading)
    const setMatchesError = useTableEntityStore(state => state.setMatchesError)
    
    const [initialized, setInitialized] = useState(false)

    // Réinitialiser quand tournamentId change
    useEffect(() => {
        setInitialized(false)
    }, [tournamentId])

    useEffect(() => {
        const fetchMatches = async () => {
            if (!tournamentId) {
                console.log('🚫 useMatchesData: no tournamentId')
                setInitialized(true)
                return
            }

            // Vérifier le cache d'abord
            const cached = getCachedMatches(tournamentId)
            console.log('🔍 useMatchesData cache check:', {
                tournamentId,
                cached: cached ? {
                    hasMatches: cached.data.matches.length > 0,
                    loading: cached.loading,
                    error: cached.error
                } : null
            })
            
            if (cached && !cached.loading && cached.data.matches.length > 0) {
                // Données en cache et valides, pas besoin de fetch
                console.log('✅ useMatchesData: using cached data')
                setInitialized(true)
                return
            }

            try {
                setMatchesLoading(tournamentId, true)
                setMatchesError(tournamentId, null)
                
                const matchesResponse = await getMatchesForTournament(tournamentId.toString())
                if (matchesResponse.error || !matchesResponse.data) {
                    setCachedMatches(tournamentId, {
                        matches: [],
                        teamsData: [],
                        teamImages: [],
                        lastMatches: false
                    })
                    setInitialized(true)
                    return
                }
                
                const matches = matchesResponse.data.data || []
                const isLastMatches = matchesResponse.data.type === 'last'
                
                if (matches.length === 0) {
                    setCachedMatches(tournamentId, {
                        matches: [],
                        teamsData: [],
                        teamImages: [],
                        lastMatches: isLastMatches
                    })
                    setInitialized(true)
                    return
                }
                
                // Get team names
                const teamNames = new Set<string>()
                matches.forEach((match) => {
                    if (match.team1) teamNames.add(match.team1)
                    if (match.team2) teamNames.add(match.team2)
                })
                
                // Fetch teams and images
                const teamsResponse = await getTeamsByNames(Array.from(teamNames))
                const teams = teamsResponse.data || []
                
                const teamImages = await Promise.all(
                    matches.map(async (match) => {
                        const team1 = teams.find((team) => team.overviewPage === match.team1)
                        const team2 = teams.find((team) => team.overviewPage === match.team2)
                        
                        const [team1ImageResponse, team2ImageResponse] = await Promise.all([
                            getTeamImage(team1?.image?.replace('.png', '.webp') || ''),
                            getTeamImage(team2?.image?.replace('.png', '.webp') || '')
                        ])
                        
                        return {
                            team1Image: team1ImageResponse.data,
                            team2Image: team2ImageResponse.data,
                        }
                    })
                )
                
                // Stocker dans le cache
                setCachedMatches(tournamentId, {
                    matches,
                    teamsData: teams,
                    teamImages,
                    lastMatches: isLastMatches
                })
                
            } catch (err) {
                console.error('Error fetching matches data:', err)
                setMatchesError(tournamentId, err instanceof Error ? err.message : 'Failed to fetch matches')
            }
            
            setInitialized(true)
        }

        if (!initialized) {
            fetchMatches()
        }
    }, [tournamentId, initialized, getCachedMatches, setCachedMatches, setMatchesLoading, setMatchesError])

    // Récupérer les données du cache
    const cached = tournamentId ? getCachedMatches(tournamentId) : null
    
    return {
        data: cached ? {
            matches: cached.data.matches,
            teamsData: cached.data.teamsData,
            teamImages: cached.data.teamImages,
            lastMatches: cached.data.lastMatches
        } : null,
        loading: (cached?.loading || false) || (!initialized && !!tournamentId),
        error: cached?.error || null
    }
}