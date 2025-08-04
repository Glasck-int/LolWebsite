import prisma from './prisma'
import { FastifyRedis } from '@fastify/redis'
import { getPlayerRedirectNames, PlayerNotFoundError } from '../utils/playerUtils'

export interface ChampionStatsFilter {
    tournament?: string
    player?: string
    team?: string
}

export interface ChampionStatsOptions {
    includePickRate?: boolean
    includePresenceRate?: boolean
    cacheKey: string
    cacheTTL: number
    redis: FastifyRedis
}

/**
 * Shared service for champion statistics calculation and caching
 */
export class ChampionStatsService {
    /**
     * Calculate champion statistics from scoreboard data
     */
    static calculateChampionStats(games: any[], totalGamesContext?: number, gameData?: any[], presenceData?: { picks: Set<string>, bans: Set<string> }) {
        const championsMap = new Map()
        const playersByChampion = new Map() // Track unique players per champion
        const gameLengthsByChampion = new Map() // Track game lengths for damage per minute calculation

        games.forEach(game => {
            const champion = game.champion
            if (!champion) return

            if (!championsMap.has(champion)) {
                championsMap.set(champion, {
                    champion,
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
                    totalKillParticipation: 0, // Sum of all kill participation percentages
                    totalGameMinutes: 0 // For damage per minute calculation
                })
                playersByChampion.set(champion, new Set())
                gameLengthsByChampion.set(champion, [])
            }

            const stats = championsMap.get(champion)
            const playersSet = playersByChampion.get(champion)
            const gameLengths = gameLengthsByChampion.get(champion)
            
            stats.gamesPlayed++
            
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

            // Track unique players
            if (game.link) {
                playersSet.add(game.link)
            }

            // Track game length for damage per minute calculation
            if (game.gamelengthNumber && game.gamelengthNumber > 0) {
                gameLengths.push(game.gamelengthNumber)
                stats.totalGameMinutes += game.gamelengthNumber
            }
        })

        // Convert to array and calculate derived statistics
        const championsArray = Array.from(championsMap.values()).map(stats => {
            const champion = stats.champion
            const winRate = stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0
            const avgKills = stats.gamesPlayed > 0 ? stats.totalKills / stats.gamesPlayed : 0
            const avgDeaths = stats.gamesPlayed > 0 ? stats.totalDeaths / stats.gamesPlayed : 0
            const avgAssists = stats.gamesPlayed > 0 ? stats.totalAssists / stats.gamesPlayed : 0
            const kda = avgDeaths > 0 ? (avgKills + avgAssists) / avgDeaths : (avgKills + avgAssists)
            const avgGold = stats.gamesPlayed > 0 ? stats.totalGold / stats.gamesPlayed : 0
            const avgCs = stats.gamesPlayed > 0 ? stats.totalCs / stats.gamesPlayed : 0
            const avgDamageToChampions = stats.gamesPlayed > 0 ? stats.totalDamageToChampions / stats.gamesPlayed : 0
            const avgVisionScore = stats.gamesPlayed > 0 ? stats.totalVisionScore / stats.gamesPlayed : 0
            
            // Calculate new metrics
            const avgKillParticipation = stats.gamesPlayed > 0 ? stats.totalKillParticipation / stats.gamesPlayed : 0
            const uniquePlayers = playersByChampion.get(champion)?.size || 0
            const avgDamagePerMinute = (stats.totalGameMinutes > 0 && stats.totalDamageToChampions > 0) 
                ? stats.totalDamageToChampions / stats.totalGameMinutes 
                : 0

            // Calculate pick rate and presence rate
            const pickRate = totalGamesContext ? (stats.gamesPlayed / totalGamesContext) * 100 : undefined
            let presenceRate: number | undefined = undefined
            
            if (presenceData && totalGamesContext) {
                const isPicked = presenceData.picks.has(champion)
                const isBanned = presenceData.bans.has(champion)
                const pickCount = isPicked ? stats.gamesPlayed : 0
                const banCount = isBanned ? 1 : 0 // Simplified: if champion appears in bans, count as 1
                const presenceCount = pickCount + (isBanned ? Math.max(1, Math.floor(totalGamesContext * 0.1)) : 0) // Estimate ban frequency
                presenceRate = Math.min(100, (presenceCount / totalGamesContext) * 100)
            }

            return {
                ...stats,
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
                uniquePlayers,
                avgDamagePerMinute: Math.round(avgDamagePerMinute * 10) / 10,
                pickRate,
                presenceRate: presenceRate !== undefined ? Math.round(presenceRate * 100) / 100 : undefined
            }
        })

        // Sort by games played (descending), then by win rate (descending)
        return championsArray.sort((a, b) => {
            if (b.gamesPlayed !== a.gamesPlayed) {
                return b.gamesPlayed - a.gamesPlayed
            }
            return b.winRate - a.winRate
        })
    }

    /**
     * Get champion statistics with caching
     */
    static async getChampionStats(filter: ChampionStatsFilter, options: ChampionStatsOptions) {
        const { redis, cacheKey, cacheTTL } = options

        // Check cache first
        const cached = await redis.get(cacheKey)
        if (cached) {
            return JSON.parse(cached)
        }

        // Build database query based on filter
        const whereClause: any = {
            champion: { not: null }
        }

        // Handle tournament filter
        if (filter.tournament) {
            // Try to find data by tournament field first, then by overviewPage
            const tournamentConditions = [
                { tournament: filter.tournament },
                { 
                    // Match games where overviewPage contains the tournament identifier
                    overviewPage: { contains: filter.tournament }
                }
            ]
            
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

        // Fetch scoreboard data with additional fields for new metrics
        const scoreboardData = await prisma.scoreboardPlayers.findMany({
            where: whereClause,
            select: {
                champion: true,
                kills: true,
                deaths: true,
                assists: true,
                gold: true,
                cs: true,
                damageToChampions: true,
                visionScore: true,
                playerWin: true,
                teamKills: true, // For kill participation calculation
                link: true, // For unique players count
                overviewPage: true // For linking to game data
            }
        })

        if (scoreboardData.length === 0) {
            return null
        }

        // Get unique overviewPages to fetch game length data
        const overviewPages = [...new Set(scoreboardData.map(game => game.overviewPage).filter((page): page is string => page !== null))]
        
        // Fetch game length data for damage per minute calculation
        const gameData = overviewPages.length > 0 ? await prisma.scoreboardGame.findMany({
            where: {
                overviewPage: { in: overviewPages }
            },
            select: {
                overviewPage: true,
                gamelengthNumber: true,
                team1Picks: true,
                team2Picks: true,
                team1Bans: true,
                team2Bans: true
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

        // Calculate total games for pick rate (only for tournament context)
        let totalGames: number | undefined
        if (filter.tournament && !filter.player && !filter.team) {
            // Try to count by tournament field first, then by overviewPage
            const tournamentGames = await prisma.scoreboardGame.count({
                where: { tournament: filter.tournament }
            })
            
            if (tournamentGames === 0) {
                // If no games found by tournament field, try by overviewPage
                totalGames = await prisma.scoreboardGame.count({
                    where: { 
                        overviewPage: { contains: filter.tournament }
                    }
                })
            } else {
                totalGames = tournamentGames
            }
        }

        // Prepare presence data for tournament-level statistics
        let presenceData: { picks: Set<string>, bans: Set<string> } | undefined
        if (options.includePresenceRate && filter.tournament && !filter.player && !filter.team) {
            const allPicks = new Set<string>()
            const allBans = new Set<string>()
            
            // Use the same gameData that was already fetched based on overviewPages from scoreboard data
            gameData.forEach(game => {
                // Add picks
                if (game.team1Picks) game.team1Picks.forEach(pick => pick && allPicks.add(pick))
                if (game.team2Picks) game.team2Picks.forEach(pick => pick && allPicks.add(pick))
                
                // Add bans
                if (game.team1Bans) game.team1Bans.forEach(ban => ban && allBans.add(ban))
                if (game.team2Bans) game.team2Bans.forEach(ban => ban && allBans.add(ban))
            })
            
            presenceData = { picks: allPicks, bans: allBans }
        }

        const championStats = this.calculateChampionStats(enrichedScoreboardData, totalGames, gameData, presenceData)
        const uniqueChampions = championStats.length

        const result = {
            ...filter,
            totalGames: scoreboardData.length,
            uniqueChampions,
            champions: championStats,
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