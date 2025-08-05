import useSWR from 'swr'
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
 * SWR hook for fetching and caching next matches data
 * 
 * @param tournamentId - Tournament ID to fetch matches for
 * @returns Object with matches data, loading state, and error
 */
export const useNextMatchesSWR = (tournamentId: number | undefined) => {
    const { data, error, isLoading } = useSWR(
        tournamentId ? `next-matches-${tournamentId}` : null,
        async () => {
            if (!tournamentId) return null

            // Get matches using the corrected API endpoint
            const matchesResponse = await getMatchesForTournament(tournamentId.toString())
            if (matchesResponse.error || !matchesResponse.data) {
                throw new Error(matchesResponse.error || 'Failed to fetch matches')
            }

            const matches = matchesResponse.data.data || []
            const isLastMatches = matchesResponse.data.type === 'last'
            
            if (matches.length === 0) {
                return {
                    matches: [],
                    teamsData: [],
                    teamImages: [],
                    lastMatches: isLastMatches
                }
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
            
            return {
                matches,
                teamsData: teams,
                teamImages,
                lastMatches: isLastMatches
            }
        },
        {
            revalidateOnFocus: false,
            revalidateOnMount: true,
            dedupingInterval: 180000, // 3 minutes for matches (more frequent than standings)
            errorRetryCount: 1
        }
    )

    return {
        data: data || null,
        loading: isLoading,
        error: error?.message || null
    }
}