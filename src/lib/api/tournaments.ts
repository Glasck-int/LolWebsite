import {
    Standings as StandingsType,
    Tournament as TournamentType,
} from '../../../backend/src/generated/prisma'
import { MatchScheduleGameType } from '../../../backend/src/schemas/matchScheduleGame'
import { apiRequest, ApiResponse } from './utils'

/**
 * Get tournaments by league ID
 *
 * @param leagueId - The ID of the league to fetch tournaments for
 * @returns Promise with array of tournaments or error
 */
async function getTournamentsByLeagueName(
    leagueName: string
): Promise<ApiResponse<TournamentType[]>> {
    return apiRequest<TournamentType[]>(`/api/tournaments/league/${leagueName}`)
}

/**
 * Get standings by tournament overview page
 *
 * @param tournamentOverviewPage - The overview page of the tournament to fetch standings for
 * @returns Promise with array of standings or error
 */
async function getTournamentsStandingsByTournamentOverviewPage(
    tournamentOverviewPage: string
): Promise<ApiResponse<StandingsType[]>> {
    // Encode the overviewPage to handle special characters in URLs
    const encodedOverviewPage = encodeURIComponent(tournamentOverviewPage)
    return apiRequest<StandingsType[]>(
        `/api/tournaments/${encodedOverviewPage}/standings`
    )
}

/**
 * Get all match schedule games for a tournament by tournament overview page
 *
 * @param tournamentOverviewPage - The overview page of the tournament to fetch games for
 * @returns Promise with array of match schedule games or error
 */
async function getTournamentsGamesByTournamentOverviewPage(
    tournamentOverviewPage: string
): Promise<ApiResponse<MatchScheduleGameType[]>> {
    // Encode the overviewPage to handle special characters in URLs
    const encodedOverviewPage = encodeURIComponent(tournamentOverviewPage)
    console.log('encodedOverviewPage', encodedOverviewPage)
    return apiRequest<MatchScheduleGameType[]>(
        `/api/tournaments/${encodedOverviewPage}/games`
    )
}

export {
    getTournamentsByLeagueName,
    getTournamentsStandingsByTournamentOverviewPage,
    getTournamentsGamesByTournamentOverviewPage,
}
