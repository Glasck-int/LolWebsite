import { useQuery } from '@tanstack/react-query'
import { getTournamentStandingsByTournamentId } from '@/lib/api/tournaments'
import { getTeamsByNames, getTeamsRecentGames, getTeamsRecentMatches } from '@/lib/api/teams'
import { getTeamImage, getTeamImageByName } from '@/lib/api/image'
import { processStandingsData } from '@/components/leagues/Standings/utils/StandingsDataProcessor'
import { Standings, Team } from '@/generated/prisma'

export interface StandingsOverviewData {
    processedData: ReturnType<typeof processStandingsData>
    tournamentName: string
}

/**
 * React Query hook for fetching and caching standings overview data
 * Equivalent to the previous useStandingsOverviewSWR hook
 * 
 * @param tournamentId - Tournament ID to fetch standings for
 * @returns Object with processedData, loading state, and error
 */
export const useStandingsOverviewQuery = (tournamentId: number | undefined) => {
    const { data, error, isLoading } = useQuery({
        queryKey: ['standings-overview', tournamentId],
        queryFn: async (): Promise<StandingsOverviewData> => {
            if (!tournamentId) {
                throw new Error('Tournament ID is required')
            }

            // Get standings
            const standingsResponse = await getTournamentStandingsByTournamentId(tournamentId.toString())
            if (standingsResponse.error || !standingsResponse.data) {
                // Return empty data instead of throwing error for tournaments without standings
                return {
                    processedData: [],
                    tournamentName: 'Unknown Tournament'
                }
            }

            const standings: Standings[] = standingsResponse.data
            
            if (standings.length === 0) {
                return {
                    processedData: [],
                    tournamentName: 'Unknown Tournament'
                }
            }

            // Extract team names
            const teamNames = standings
                .map((s) => s.team)
                .filter((name): name is string => !!name)

            // Get tournament name from first standing's overviewPage
            const tournamentName = standings[0]?.overviewPage || 'Unknown Tournament'

            // Fetch all required data in parallel
            const [teamsDataResponse, teamsRecentMatchesResponse, gamesRecentResponse] = 
                await Promise.all([
                    getTeamsByNames(teamNames),
                    getTeamsRecentMatches(teamNames, tournamentName),
                    getTeamsRecentGames(teamNames, tournamentName),
                ])

            const teamsData = teamsDataResponse.data || []
            const teamsRecentMatches = teamsRecentMatchesResponse.data || []

            // Fetch team images
            const teamImagePromises = teamsData.map(async (team: Team) => {
                // Try with team image first
                let teamImageResponse = await getTeamImage(
                    team.image?.replace('.png', '.webp') || ''
                )

                // Fallback to team name if image doesn't work
                if (!teamImageResponse.data && team.overviewPage) {
                    teamImageResponse = await getTeamImageByName(team.overviewPage)
                }

                return {
                    teamName: team.overviewPage,
                    imageUrl: teamImageResponse.data || '',
                }
            })

            const teamImageResults = await Promise.all(teamImagePromises)
            const teamsImages: Record<string, string> = teamImageResults.reduce(
                (acc, result) => {
                    if (result.teamName) {
                        acc[result.teamName] = result.imageUrl
                    }
                    return acc
                },
                {} as Record<string, string>
            )

            // Process standings data
            const processedData = processStandingsData(
                standings,
                teamsData,
                teamsImages,
                teamsRecentMatches,
                gamesRecentResponse.data || []
            )

            return {
                processedData,
                tournamentName
            }
        },
        enabled: !!tournamentId,
        
        // Cache configuration equivalent to SWR settings
        staleTime: 300000, // 5 minutes
        gcTime: 600000, // 10 minutes garbage collection
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: 1,
    })

    return {
        data: data || null,
        loading: isLoading,
        error: error?.message || null
    }
}