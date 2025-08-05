import { apiRequest, ApiResponse } from './utils'

/**
 * Player performance statistics interface
 */
export interface PlayerStats {
    player: string
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
    avgKillParticipation: number
    avgCs: number
    avgCsPerMinute: number
    avgGold: number
    avgGoldPerMinute: number
    avgDamageToChampions: number
    avgDamagePerMinute: number
    avgVisionScore: number
    totalCs: number
    totalGold: number
    totalDamageToChampions: number
    totalVisionScore: number
    totalKillParticipation: number
    totalGameMinutes: number
}

/**
 * Tournament player statistics response structure
 */
export interface TournamentPlayerStatsResponse {
    tournament: string
    totalGames: number
    uniquePlayers: number
    players: PlayerStats[]
    meta: {
        cached: boolean
        timestamp: string
    }
}

/**
 * Player statistics response structure
 */
export interface PlayerStatsResponse {
    player: string
    tournament?: string
    totalGames: number
    stats: PlayerStats
    meta: {
        cached: boolean
        timestamp: string
    }
}

/**
 * Team player statistics response structure
 */
export interface TeamPlayerStatsResponse {
    team: string
    tournament?: string
    totalGames: number
    players: PlayerStats[]
    meta: {
        cached: boolean
        timestamp: string
    }
}

/**
 * Get all player statistics for a specific tournament
 *
 * @param tournament - The tournament name to fetch player stats for
 * @returns Promise with tournament player statistics data or error
 */
async function getTournamentPlayerStats(
    tournament: string
): Promise<ApiResponse<TournamentPlayerStatsResponse>> {
    return apiRequest<TournamentPlayerStatsResponse>(
        `/api/players/stats/tournament/${encodeURIComponent(tournament)}`
    )
}

/**
 * Get statistics for a specific player
 *
 * @param playerName - The player name to fetch stats for
 * @returns Promise with player statistics data or error
 */
async function getPlayerStats(
    playerName: string
): Promise<ApiResponse<PlayerStatsResponse>> {
    return apiRequest<PlayerStatsResponse>(
        `/api/players/stats/player/${encodeURIComponent(playerName)}`
    )
}

/**
 * Get statistics for a specific player in a tournament
 *
 * @param playerName - The player name to fetch stats for
 * @param tournament - The tournament name to filter stats by
 * @returns Promise with player statistics data or error
 */
async function getPlayerStatsInTournament(
    playerName: string,
    tournament: string
): Promise<ApiResponse<PlayerStatsResponse>> {
    return apiRequest<PlayerStatsResponse>(
        `/api/players/stats/player/${encodeURIComponent(playerName)}/tournament/${encodeURIComponent(tournament)}`
    )
}

/**
 * Get player statistics for a specific team
 *
 * @param teamName - The team name to fetch player stats for
 * @returns Promise with team player statistics data or error
 */
async function getTeamPlayerStats(
    teamName: string
): Promise<ApiResponse<TeamPlayerStatsResponse>> {
    return apiRequest<TeamPlayerStatsResponse>(
        `/api/players/stats/team/${encodeURIComponent(teamName)}`
    )
}

/**
 * Get player statistics for a specific team in a tournament
 *
 * @param teamName - The team name to fetch player stats for
 * @param tournament - The tournament name to filter stats by
 * @returns Promise with team player statistics data or error
 */
async function getTeamPlayerStatsInTournament(
    teamName: string,
    tournament: string
): Promise<ApiResponse<TeamPlayerStatsResponse>> {
    return apiRequest<TeamPlayerStatsResponse>(
        `/api/players/stats/team/${encodeURIComponent(teamName)}/tournament/${encodeURIComponent(tournament)}`
    )
}

export {
    getTournamentPlayerStats,
    getPlayerStats,
    getPlayerStatsInTournament,
    getTeamPlayerStats,
    getTeamPlayerStatsInTournament,
}