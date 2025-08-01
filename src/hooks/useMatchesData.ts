import { useState, useEffect } from 'react'
import { useTableEntityStore } from '@/store/tableEntityStore'
import { getMatchesForTournament } from '@/lib/api/tournaments'
import { getTeamsByNames } from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'
import { MatchSchedule } from '@/generated/prisma'

export interface NextMatchesData {
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
 * Hook to automatically fetch matches data from the API
 * with intelligent caching to avoid re-fetches
 * 
 * @param tournamentId - ID of the tournament to fetch matches from
 * @returns { data: NextMatchesData | null, loading: boolean, error: string | null }
 */
export const useMatchesData = (tournamentId: number | undefined) => {
    const getCachedMatches = useTableEntityStore(state => state.getCachedMatches)
    const setCachedMatches = useTableEntityStore(state => state.setCachedMatches)
    const setMatchesLoading = useTableEntityStore(state => state.setMatchesLoading)
    const setMatchesError = useTableEntityStore(state => state.setMatchesError)
    
    const [initialized, setInitialized] = useState(false)

    // Reset when tournamentId changes
    useEffect(() => {
        setInitialized(false)
    }, [tournamentId])

    useEffect(() => {
        const fetchMatches = async () => {
            if (!tournamentId) {
                setInitialized(true)
                return
            }

            // Check cache first
            const cached = getCachedMatches(tournamentId)
            
            
            if (cached && !cached.loading && cached.data.matches.length > 0) {
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
                
                // Store in cache
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

    // Get cached data
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