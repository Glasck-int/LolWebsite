import { apiRequest, ApiResponse } from './utils'

/**
 * Champion performance statistics interface
 */
export interface ChampionStats {
    champion: string
    gamesPlayed: number
    wins: number
    losses: number
    winRate: number
    totalKills: number
    totalDeaths: number
    totalAssists: number
    avgKills: number
    avgDeaths: number
    avgAssists: number
    kda: number
    avgGold: number
    avgCs: number
    avgDamageToChampions: number
    avgVisionScore: number
    totalGold: number
    totalCs: number
    totalDamageToChampions: number
    totalVisionScore: number
    pickRate?: number
    banRate?: number
    presenceRate?: number
    avgKillParticipation: number
    uniquePlayers: number
    avgDamagePerMinute: number
}

/**
 * Tournament champion statistics response structure
 */
export interface TournamentChampionStatsResponse {
    tournament: string
    totalGames: number
    uniqueChampions: number
    champions: ChampionStats[]
    meta: {
        cached: boolean
        timestamp: string
    }
}

/**
 * Player champion statistics response structure
 */
export interface PlayerChampionStatsResponse {
    player: string
    tournament?: string
    totalGames: number
    uniqueChampions: number
    champions: ChampionStats[]
    meta: {
        cached: boolean
        timestamp: string
    }
}

/**
 * Team champion statistics response structure
 */
export interface TeamChampionStatsResponse {
    team: string
    tournament?: string
    totalGames: number
    uniqueChampions: number
    champions: ChampionStats[]
    meta: {
        cached: boolean
        timestamp: string
    }
}

/**
 * Get all champion statistics for a specific tournament
 *
 * @param tournament - The tournament name to fetch champion stats for
 * @returns Promise with tournament champion statistics data or error
 */
async function getTournamentChampionStats(
    tournament: string
): Promise<ApiResponse<TournamentChampionStatsResponse>> {
    return apiRequest<TournamentChampionStatsResponse>(
        `/api/champions/stats/tournament/${encodeURIComponent(tournament)}`
    )
}

/**
 * Get champion statistics for a specific player
 *
 * @param playerName - The player name to fetch champion stats for
 * @returns Promise with player champion statistics data or error
 */
async function getPlayerChampionStats(
    playerName: string
): Promise<ApiResponse<PlayerChampionStatsResponse>> {
    return apiRequest<PlayerChampionStatsResponse>(
        `/api/champions/stats/player/${encodeURIComponent(playerName)}`
    )
}

/**
 * Get champion statistics for a specific player in a tournament
 *
 * @param playerName - The player name to fetch champion stats for
 * @param tournament - The tournament name to filter stats by
 * @returns Promise with player champion statistics data or error
 */
async function getPlayerChampionStatsInTournament(
    playerName: string,
    tournament: string
): Promise<ApiResponse<PlayerChampionStatsResponse>> {
    return apiRequest<PlayerChampionStatsResponse>(
        `/api/champions/stats/player/${encodeURIComponent(playerName)}/tournament/${encodeURIComponent(tournament)}`
    )
}

/**
 * Get champion statistics for a specific team
 *
 * @param teamName - The team name to fetch champion stats for
 * @returns Promise with team champion statistics data or error
 */
async function getTeamChampionStats(
    teamName: string
): Promise<ApiResponse<TeamChampionStatsResponse>> {
    return apiRequest<TeamChampionStatsResponse>(
        `/api/champions/stats/team/${encodeURIComponent(teamName)}`
    )
}

/**
 * Get champion statistics for a specific team in a tournament
 *
 * @param teamName - The team name to fetch champion stats for
 * @param tournament - The tournament name to filter stats by
 * @returns Promise with team champion statistics data or error
 */
async function getTeamChampionStatsInTournament(
    teamName: string,
    tournament: string
): Promise<ApiResponse<TeamChampionStatsResponse>> {
    return apiRequest<TeamChampionStatsResponse>(
        `/api/champions/stats/team/${encodeURIComponent(teamName)}/tournament/${encodeURIComponent(tournament)}`
    )
}

export {
    getTournamentChampionStats,
    getPlayerChampionStats,
    getPlayerChampionStatsInTournament,
    getTeamChampionStats,
    getTeamChampionStatsInTournament,
}