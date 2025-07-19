import { Standings, Tournament, MatchSchedule } from '@/generated/prisma'
import {
    MatchScheduleGame,
    ScoreboardPlayers,
} from '@/generated/prisma'
import { apiRequest, ApiResponse } from './utils'
import { PlayerStatsType } from '../../../backend/src/schemas/scoreboardPlayers'

async function getLastThreeMatchesForTournament(
    tournamentId: string
): Promise<ApiResponse<MatchSchedule[]>> {
    console.log('tournamentId', tournamentId)
    return apiRequest<MatchSchedule[]>(
        `/api/tournaments/${tournamentId}/last-matches`
    )
}

async function getNextThreeMatchesForTournament(
    tournamentId: string
): Promise<ApiResponse<MatchSchedule[]>> {
    return apiRequest<MatchSchedule[]>(
        `/api/tournaments/${tournamentId}/next-matches`
    )
}

/**
 * Get tournaments by league ID
 *
 * @param leagueId - The ID of the league to fetch tournaments for
 * @returns Promise with array of tournaments or error
 */
async function getTournamentsByLeagueName(
    leagueName: string
): Promise<ApiResponse<Tournament[]>> {
    const encodedLeagueName = encodeURIComponent(leagueName)
    return apiRequest<Tournament[]>(
        `/api/tournaments/league/${encodedLeagueName}`
    )
}

/**
 * Get standings by tournament overview page
 *
 * @param tournamentOverviewPage - The overview page of the tournament to fetch standings for
 * @returns Promise with array of standings or error
 */
async function getTournamentsStandingsByTournamentOverviewPage(
    tournamentOverviewPage: string
): Promise<ApiResponse<Standings[]>> {
    // Encode the overviewPage to handle special characters in URLs
    const encodedOverviewPage = encodeURIComponent(tournamentOverviewPage)
    return apiRequest<Standings[]>(
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
): Promise<ApiResponse<MatchScheduleGame[]>> {
    // Encode the overviewPage to handle special characters in URLs
    const encodedOverviewPage = encodeURIComponent(tournamentOverviewPage)
    console.log('encodedOverviewPage', encodedOverviewPage)
    return apiRequest<MatchScheduleGame[]>(
        `/api/tournaments/${encodedOverviewPage}/games`
    )
}

/**
 * Get scoreboard players by tournament overview page
 *
 * @param tournamentOverviewPage - The overview page of the tournament to fetch scoreboard players for
 * @returns Promise with array of scoreboard players or error
 */
async function getTournamentsScoreboardPlayersByTournamentOverviewPage(
    tournamentOverviewPage: string
): Promise<ApiResponse<ScoreboardPlayers[]>> {
    const encodedOverviewPage = encodeURIComponent(tournamentOverviewPage)
    return apiRequest<ScoreboardPlayers[]>(
        `/api/tournaments/${encodedOverviewPage}/scoreboardplayers`
    )
}

async function getTournamentPlayersStatsByTournamentOverviewPage(
    tournamentOverviewPage: string
): Promise<ApiResponse<{ players: PlayerStatsType[] }>> {
    const encodedOverviewPage = encodeURIComponent(tournamentOverviewPage)
    return apiRequest<{ players: PlayerStatsType[] }>(
        `/api/tournaments/${encodedOverviewPage}/player-stats`
    )
}

export {
    getTournamentsByLeagueName,
    getTournamentsStandingsByTournamentOverviewPage,
    getTournamentsGamesByTournamentOverviewPage,
    getTournamentsScoreboardPlayersByTournamentOverviewPage,
    getTournamentPlayersStatsByTournamentOverviewPage,
    getLastThreeMatchesForTournament,
    getNextThreeMatchesForTournament,
}
