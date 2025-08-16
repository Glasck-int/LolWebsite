import prisma from './prisma'
import { FastifyRedis } from '@fastify/redis'
import { getPlayerRedirectNames, PlayerNotFoundError } from '../utils/playerUtils'
import { getTournamentConditions } from '../utils/tournamentUtils'

export interface PlayerStatsFilter {
    tournament?: string
    player?: string
    team?: string
}

export interface PlayerStatsOptions {
    cacheKey: string
    cacheTTL: number
    redis: FastifyRedis
}

/**
 * Shared service for player statistics calculation and caching
 */
export class PlayerStatsService {
    /**
     * Calculate player statistics from scoreboard data
     */
    static calculatePlayerStats(games: any[], playerRoles: Map<string, string> = new Map(), playerNames: Map<string, string> = new Map()) {
        const playersMap = new Map()
        const gameLengthsByPlayer = new Map() // Track game lengths for per-minute calculations
        const championsByPlayer = new Map() // Track unique champions per player

        games.forEach(game => {
            const player = game.link
            if (!player) return

            if (!playersMap.has(player)) {
                playersMap.set(player, {
                    player: player, // This is the link/identifier
                    name: playerNames.get(player) || player, // Display name (fallback to player if name is empty)
                    role: playerRoles.get(player) || null,
                    gamesPlayed: 0,
                    wins: 0,
                    losses: 0,
                    totalKills: 0,
                    totalDeaths: 0,
                    totalAssists: 0,
                    totalGold: 0,
                    totalCs: 0,
                    totalDamageToChampions: 0,
                    totalVisionScore: 0,
                    totalKillParticipation: 0,
                    totalGameMinutes: 0
                })
                gameLengthsByPlayer.set(player, [])
                championsByPlayer.set(player, new Set())
            }

            const stats = playersMap.get(player)
            const gameLengths = gameLengthsByPlayer.get(player)
            const champions = championsByPlayer.get(player)
            
            stats.gamesPlayed++
            
            // Track unique champions
            if (game.champion) {
                champions.add(game.champion)
            }
            
            if (game.playerWin === 'Yes') {
                stats.wins++
            } else {
                stats.losses++
            }

            stats.totalKills += game.kills || 0
            stats.totalDeaths += game.deaths || 0
            stats.totalAssists += game.assists || 0
            stats.totalGold += game.gold || 0
            stats.totalCs += game.cs || 0
            stats.totalDamageToChampions += game.damageToChampions || 0
            stats.totalVisionScore += game.visionScore || 0

            // Calculate kill participation for this game
            const kills = game.kills || 0
            const assists = game.assists || 0
            const teamKills = game.teamKills || 1 // Avoid division by zero
            const killParticipation = teamKills > 0 ? ((kills + assists) / teamKills) * 100 : 0
            stats.totalKillParticipation += killParticipation

            // Track game length for per-minute calculations
            if (game.gamelengthNumber && game.gamelengthNumber > 0) {
                gameLengths.push(game.gamelengthNumber)
                stats.totalGameMinutes += game.gamelengthNumber
            }
        })

        // Convert to array and calculate derived statistics
        const playersArray = Array.from(playersMap.values()).map(stats => {
            const winRate = stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0
            const avgKills = stats.gamesPlayed > 0 ? stats.totalKills / stats.gamesPlayed : 0
            const avgDeaths = stats.gamesPlayed > 0 ? stats.totalDeaths / stats.gamesPlayed : 0
            const avgAssists = stats.gamesPlayed > 0 ? stats.totalAssists / stats.gamesPlayed : 0
            const kda = avgDeaths > 0 ? (avgKills + avgAssists) / avgDeaths : (avgKills + avgAssists)
            const avgGold = stats.gamesPlayed > 0 ? stats.totalGold / stats.gamesPlayed : 0
            const avgCs = stats.gamesPlayed > 0 ? stats.totalCs / stats.gamesPlayed : 0
            const avgDamageToChampions = stats.gamesPlayed > 0 ? stats.totalDamageToChampions / stats.gamesPlayed : 0
            const avgVisionScore = stats.gamesPlayed > 0 ? stats.totalVisionScore / stats.gamesPlayed : 0
            const avgKillParticipation = stats.gamesPlayed > 0 ? stats.totalKillParticipation / stats.gamesPlayed : 0

            // Calculate per-minute stats
            const avgCsPerMinute = (stats.totalGameMinutes > 0 && stats.totalCs > 0) 
                ? stats.totalCs / stats.totalGameMinutes 
                : 0
            const avgGoldPerMinute = (stats.totalGameMinutes > 0 && stats.totalGold > 0) 
                ? stats.totalGold / stats.totalGameMinutes 
                : 0
            const avgDamagePerMinute = (stats.totalGameMinutes > 0 && stats.totalDamageToChampions > 0) 
                ? stats.totalDamageToChampions / stats.totalGameMinutes 
                : 0

            // Get unique champions count
            const uniqueChampions = championsByPlayer.get(stats.player)?.size || 0

            // Destructure to exclude internal calculation values
            const { totalKillParticipation, totalGameMinutes, ...publicStats } = stats
            
            return {
                ...publicStats,
                winRate: Math.round(winRate * 100) / 100,
                avgKills: Math.round(avgKills * 100) / 100,
                avgDeaths: Math.round(avgDeaths * 100) / 100,
                avgAssists: Math.round(avgAssists * 100) / 100,
                kda: Math.round(kda * 100) / 100,
                avgGold: Math.round(avgGold),
                avgCs: Math.round(avgCs * 10) / 10,
                avgDamageToChampions: Math.round(avgDamageToChampions),
                avgVisionScore: Math.round(avgVisionScore * 10) / 10,
                avgKillParticipation: Math.round(avgKillParticipation * 100) / 100,
                avgCsPerMinute: Math.round(avgCsPerMinute * 10) / 10,
                avgGoldPerMinute: Math.round(avgGoldPerMinute),
                avgDamagePerMinute: Math.round(avgDamagePerMinute * 10) / 10,
                uniqueChampions
            }
        })

        // Sort by KDA (descending), then by win rate (descending)
        return playersArray.sort((a, b) => {
            if (b.kda !== a.kda) {
                return b.kda - a.kda
            }
            return b.winRate - a.winRate
        })
    }

    /**
     * Get player statistics with caching
     */
    static async getPlayerStats(filter: PlayerStatsFilter, options: PlayerStatsOptions) {
        const { redis, cacheKey, cacheTTL } = options

        // Check cache first
        const cached = await redis.get(cacheKey)
        if (cached) {
            return JSON.parse(cached)
        }

        // Build database query based on filter
        const whereClause: any = {}

        // Handle tournament filter
        if (filter.tournament) {
            // Get tournament conditions that handle both ID and name
            const tournamentConditions = await getTournamentConditions(filter.tournament)
            
            // If we have other filters, combine them properly
            if (filter.player || filter.team) {
                whereClause.AND = [
                    { OR: tournamentConditions }
                ]
            } else {
                whereClause.OR = tournamentConditions
            }
        }
        
        // Handle player filter with redirect support
        if (filter.player) {
            try {
                // Use the player utility to get all redirect names
                const allPlayerNames = await getPlayerRedirectNames(filter.player)
                const playerCondition = { link: { in: allPlayerNames } }
                
                // Add to existing AND clause or create new one
                if (whereClause.AND) {
                    whereClause.AND.push(playerCondition)
                } else if (filter.tournament) {
                    whereClause.AND = [playerCondition]
                } else {
                    Object.assign(whereClause, playerCondition)
                }
            } catch (error) {
                if (error instanceof PlayerNotFoundError) {
                    // If player not found, use original name and let query return empty results
                    const playerCondition = { link: filter.player }
                    
                    if (whereClause.AND) {
                        whereClause.AND.push(playerCondition)
                    } else if (filter.tournament) {
                        whereClause.AND = [playerCondition]
                    } else {
                        Object.assign(whereClause, playerCondition)
                    }
                } else {
                    throw error // Re-throw other errors
                }
            }
        }
        
        // Handle team filter
        if (filter.team) {
            const teamCondition = { team: filter.team }
            
            // Add to existing AND clause or create new one
            if (whereClause.AND) {
                whereClause.AND.push(teamCondition)
            } else if (filter.tournament || filter.player) {
                whereClause.AND = [teamCondition]
            } else {
                Object.assign(whereClause, teamCondition)
            }
        }

        // Fetch scoreboard data with additional fields for player statistics
        const scoreboardData = await prisma.scoreboardPlayers.findMany({
            where: whereClause,
            select: {
                link: true, // Player identifier (for URLs)
                name: true, // Player display name
                kills: true,
                deaths: true,
                assists: true,
                gold: true,
                cs: true,
                damageToChampions: true,
                visionScore: true,
                playerWin: true,
                teamKills: true, // For kill participation calculation
                overviewPage: true, // For linking to game data
                champion: true, // For unique champions calculation
                role: true // Player role in this game
            }
        })

        if (scoreboardData.length === 0) {
            return null
        }

        // Create a map of player names to their roles using the data we already have
        const playerRoles = new Map<string, string>()
        const playerNames = new Map<string, string>()
        
        // Use roles and names directly from scoreboardData (most efficient)
        scoreboardData.forEach(game => {
            if (game.link && game.role && !playerRoles.has(game.link)) {
                playerRoles.set(game.link, game.role)
            }
            // Only use game.name if it exists and is not empty, otherwise use game.link as fallback
            if (game.link && !playerNames.has(game.link)) {
                playerNames.set(game.link, game.name && game.name.trim() !== '' ? game.name : game.link)
            }
        })

        // Get unique overviewPages to fetch game length data
        const overviewPages = Array.from(new Set(scoreboardData.map(game => game.overviewPage).filter((page): page is string => page !== null)))
        
        // Fetch game length data for per-minute calculations
        const gameData = overviewPages.length > 0 ? await prisma.scoreboardGame.findMany({
            where: {
                overviewPage: { in: overviewPages }
            },
            select: {
                overviewPage: true,
                gamelengthNumber: true
            }
        }) : []

        // Create a map for easy lookup of game lengths
        const gameLengthMap = new Map()
        gameData.forEach(game => {
            if (game.gamelengthNumber) {
                gameLengthMap.set(game.overviewPage, game.gamelengthNumber)
            }
        })

        // Add game length to scoreboard data
        const enrichedScoreboardData = scoreboardData.map(game => ({
            ...game,
            gamelengthNumber: gameLengthMap.get(game.overviewPage) || null
        }))

        // Calculate player statistics
        const playerStats = this.calculatePlayerStats(enrichedScoreboardData, playerRoles, playerNames)
        const uniquePlayers = playerStats.length

        // For single player queries, return just the player's stats
        if (filter.player && !filter.team) {
            const singlePlayerStats = playerStats.find(p => p.player === filter.player) || 
                                     playerStats[0] // Fallback in case of redirect issues
            
            if (!singlePlayerStats) {
                return null
            }

            const result = {
                player: filter.player,
                tournament: filter.tournament,
                totalGames: singlePlayerStats.gamesPlayed,
                stats: singlePlayerStats,
                meta: {
                    cached: false,
                    timestamp: new Date().toISOString()
                }
            }

            // Cache the result
            await redis.setex(cacheKey, cacheTTL, JSON.stringify(result))
            return result
        }

        // For tournament or team queries, return all players
        const result = {
            tournament: filter.tournament,
            team: filter.team,
            totalGames: scoreboardData.length,
            uniquePlayers,
            players: playerStats,
            meta: {
                cached: false,
                timestamp: new Date().toISOString()
            }
        }

        // Cache the result
        await redis.setex(cacheKey, cacheTTL, JSON.stringify(result))
        return result
    }
}