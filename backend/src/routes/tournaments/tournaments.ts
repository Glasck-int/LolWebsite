import { FastifyInstance } from 'fastify'

import {
    TournamentListResponse,
    TournamentStandingsListResponse,
} from '../../schemas/tournaments'
import { ErrorResponseSchema } from '../../schemas/common'
import prisma from '../../services/prisma'
import { MatchScheduleGameListResponse } from '../../schemas/matchScheduleGame'
import { ScoreboardPlayersListResponse, PlayerStatsListResponse } from '../../schemas/scoreboardPlayers'
import { TournamentLeagueNameParamSchema, TournamentIdParamSchema, OverviewPageParamSchema, TournamentOverviewPageParamSchema } from '../../schemas/params'
import { MatchScheduleListResponse } from '../../schemas/matchShedule'

export default async function tournamentsRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis
    const customMetric = new fastify.metrics.client.Counter({
        name: 'tournaments',
        help: 'Tournaments',
        labelNames: ['operation'],
    })

    fastify.get<{ Params: { leagueName: string } }>(
        '/tournaments/league/:leagueName',
        {
            schema: {
                description: 'Get tournaments by league name',
                tags: ['tournaments'],
                params: TournamentLeagueNameParamSchema,
                response: {
                    200: TournamentListResponse,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { leagueName } = request.params
                const cacheKey = `tournaments:league:${leagueName}`
                customMetric.inc({
                    operation: 'get_tournaments_by_league_name',
                })
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // console.log(leagueName)
                const tournaments = await prisma.tournament.findMany({
                    where: {
                        league: leagueName,
                    },
                    orderBy: { dateStart: 'desc' },
                })
                // console.log(tournaments)
                if (tournaments.length === 0) {
                    return reply
                        .status(404)
                        .send({ error: 'No tournaments found' })
                }

                // Cache for 1 day (86400 seconds)
                await redis.setex(cacheKey, 86400, JSON.stringify(tournaments))
                return tournaments
            } catch (error) {
                console.error(error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )

    fastify.get<{ Params: { tournamentId: string } }>(
        '/tournaments/id/:tournamentId/standings',
        {
            schema: {
                description: 'Get standings for a tournament by tournament ID',
                tags: ['tournaments'],
                params: TournamentIdParamSchema,
                response: {
                    200: TournamentStandingsListResponse,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { tournamentId } = request.params
                const cacheKey = `tournament_standings:${tournamentId}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // Get tournament first to get the overviewPage
                const tournament = await prisma.tournament.findUnique({
                    where: { id: parseInt(tournamentId) },
                    select: { overviewPage: true },
                })

                if (!tournament) {
                    return reply
                        .status(404)
                        .send({ error: 'Tournament not found' })
                }

                // Get standings using the overviewPage
                const standings = await prisma.standings.findMany({
                    where: {
                        overviewPage: tournament.overviewPage,
                    },
                    orderBy: [
                        { place: 'asc' },
                        { points: 'desc' },
                        { winGames: 'desc' },
                    ],
                    include: {
                        Team: {
                            select: {
                                name: true,
                                short: true,
                                region: true,
                                image: true,
                                TournamentGroups: {
                                    where: {
                                        overviewPage: tournament.overviewPage,
                                    },
                                    select: {
                                        groupName: true,
                                        groupDisplay: true,
                                        groupN: true,
                                    },
                                },
                            },
                        },
                    },
                })

                if (standings.length === 0) {
                    return reply.status(404).send({
                        error: 'No standings found for this tournament',
                    })
                }

                // Cache for 1 hour (3600 seconds)
                await redis.setex(cacheKey, 3600, JSON.stringify(standings))
                return standings
            } catch (error) {
                console.error(error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )

    // Alternative route using overviewPage directly
    fastify.get<{ Params: { overviewPage: string } }>(
        '/tournaments/:overviewPage/standings',
        {
            schema: {
                description: 'Get standings for a tournament by overview page',
                tags: ['tournaments'],
                params: OverviewPageParamSchema,
                response: {
                    200: TournamentStandingsListResponse,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { overviewPage } = request.params

                // Decode the overviewPage parameter to handle URL encoding
                const decodedOverviewPage = decodeURIComponent(overviewPage)
                const cacheKey = `tournament_standings_overview:${decodedOverviewPage}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // Get standings using the decoded overviewPage
                const standings = await prisma.standings.findMany({
                    where: {
                        overviewPage: decodedOverviewPage,
                    },
                    orderBy: [
                        { place: 'asc' },
                        { points: 'desc' },
                        { winGames: 'desc' },
                    ],
                    include: {
                        Team: {
                            select: {
                                name: true,
                                short: true,
                                region: true,
                                image: true,
                                TournamentGroups: {
                                    where: {
                                        overviewPage: decodedOverviewPage,
                                    },
                                    select: {
                                        groupName: true,
                                        groupDisplay: true,
                                        groupN: true,
                                    },
                                },
                            },
                        },
                    },
                })

                if (standings.length === 0) {
                    console.log(
                        'No standings found for tournament:',
                        decodedOverviewPage
                    )
                    return reply.status(404).send({
                        error: `No standings found for tournament: ${decodedOverviewPage}`,
                    })
                }

                console.log(
                    `Found ${standings.length} standings for tournament:`,
                    decodedOverviewPage
                )

                // Cache for 1 hour (3600 seconds)
                await redis.setex(cacheKey, 3600, JSON.stringify(standings))
                return standings
            } catch (error) {
                console.error('Error in tournament standings route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )

    fastify.get<{ Params: { tournamentOverviewPage: string } }>(
        '/tournaments/:tournamentOverviewPage/games',
        {
            schema: {
                description:
                    'Get all match schedule games for a tournament by overview page',
                tags: ['tournaments'],
                params: TournamentOverviewPageParamSchema,
                response: {
                    200: MatchScheduleGameListResponse,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { tournamentOverviewPage } = request.params
                const cacheKey = `tournament_games:${tournamentOverviewPage}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // Single query with relations
                const tournamentWithGames = await prisma.tournament.findUnique({
                    where: { overviewPage: tournamentOverviewPage },
                    select: {
                        overviewPage: true,
                        MatchSchedule: {
                            select: {
                                matchId: true,
                                MatchScheduleGame: {
                                    orderBy: [
                                        { nMatchInTab: 'asc' },
                                        { nGameInMatch: 'asc' },
                                    ],
                                },
                            },
                        },
                    },
                })

                if (!tournamentWithGames) {
                    return reply
                        .status(404)
                        .send({ error: 'Tournament not found' })
                }

                // Flatten the games from all match schedules
                const games = tournamentWithGames.MatchSchedule.flatMap(
                    (schedule) => schedule.MatchScheduleGame
                )

                if (games.length === 0) {
                    return reply.status(404).send({
                        error: 'No games found for this tournament',
                    })
                }

                // Cache for 1 hour (3600 seconds)
                await redis.setex(cacheKey, 3600, JSON.stringify(games))
                return games
            } catch (error) {
                console.error('Error in tournament games route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )

    fastify.get<{ Params: { tournamentOverviewPage: string } }>(
        '/tournaments/:tournamentOverviewPage/scoreboardplayers',
        {
            schema: {
                description:
                    'Get all scoreboard players for a tournament by overview page',
                tags: ['tournaments'],
                params: TournamentOverviewPageParamSchema,
                response: {
                    200: ScoreboardPlayersListResponse,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { tournamentOverviewPage } = request.params
                const cacheKey = `tournament_scoreboardplayers:${tournamentOverviewPage}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // Get tournament end date for dynamic cache strategy
                const tournament = await prisma.tournament.findUnique({
                    where: { overviewPage: tournamentOverviewPage },
                    select: { dateEnd: true }
                })

                // Direct query to ScoreboardPlayers with tournament overviewPage
                const players = await prisma.scoreboardPlayers.findMany({
                    where: {
                        overviewPage: tournamentOverviewPage,
                    },
                    orderBy: [
                        { matchId: 'asc' },
                        { gameId: 'asc' },
                        { role_Number: 'asc' },
                    ],
                })

                if (players.length === 0) {
                    return reply.status(404).send({
                        error: 'No scoreboard players found for this tournament',
                    })
                }

                // Dynamic cache strategy based on tournament status
                let cacheTime: number

                if (!tournament?.dateEnd) {
                    // Tournament without end date = active
                    cacheTime = 300 // 5 minutes
                } else {
                    const tournamentEndDate = new Date(tournament.dateEnd)
                    const now = new Date()
                    const daysSinceEnd = Math.floor((now.getTime() - tournamentEndDate.getTime()) / (1000 * 60 * 60 * 24))
                    
                    if (tournamentEndDate > now) {
                        // Tournament not yet finished
                        cacheTime = 300 // 5 minutes
                    } else if (daysSinceEnd <= 2) {
                        // Tournament finished ≤ 2 days ago (possible corrections)
                        cacheTime = 3600 // 1 hour
                    } else if (daysSinceEnd <= 30) {
                        // Tournament finished 3-30 days ago
                        cacheTime = 604800 // 7 days
                    } else {
                        // Tournament finished > 30 days ago (historical data is fixed)
                        cacheTime = 2592000 // 30 days
                    }
                }

                await redis.setex(cacheKey, cacheTime, JSON.stringify(players))
                return players
            } catch (error) {
                console.error('Error in tournament scoreboard players route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )

    // Player stats aggregation endpoint
    fastify.get<{ Params: { tournamentOverviewPage: string } }>(
        '/tournaments/:tournamentOverviewPage/player-stats',
        {
            schema: {
                description: 'Get aggregated player statistics (KDA, damage, etc.) for a tournament',
                tags: ['tournaments'],
                params: TournamentOverviewPageParamSchema,
                response: {
                    200: PlayerStatsListResponse,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { tournamentOverviewPage } = request.params
                const cacheKey = `tournament_player_stats:${tournamentOverviewPage}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // Get tournament end date for cache strategy
                const tournament = await prisma.tournament.findUnique({
                    where: { overviewPage: tournamentOverviewPage },
                    select: { dateEnd: true }
                })

                // Récupérer SEULEMENT les champs nécessaires (plus rapide)
                const players = await prisma.scoreboardPlayers.findMany({
                    where: { overviewPage: tournamentOverviewPage },
                    select: {
                        name: true,
                        link: true,
                        team: true,
                        role: true,
                        kills: true,
                        deaths: true,
                        assists: true,
                        damageToChampions: true,
                        gold: true,
                        cs: true,
                        visionScore: true,
                        playerWin: true
                    }
                })
 

                if (players.length === 0) {
                    return reply.status(404).send({
                        error: 'No player data found for this tournament',
                    })
                }

                // Grouper par joueur et calculer les stats
                const playerStatsMap = new Map<string, any>()

                players.forEach(player => {
                    const key = `${player.name}-${player.team}-${player.role}`
                    if (!playerStatsMap.has(key)) {
                        playerStatsMap.set(key, {
                            name: player.name,
                            link: player.link,
                            team: player.team,
                            role: player.role,
                            gamesPlayed: 0,
                            totalKills: 0, 
                            totalDeaths: 0,
                            totalAssists: 0,
                            totalDamage: 0,
                            totalGold: 0,
                            totalCS: 0,
                            totalVisionScore: 0,
                            wins: 0
                        })

                    }

                    const stats = playerStatsMap.get(key)!
                    stats.gamesPlayed++
                    stats.totalKills += player.kills || 0
                    stats.totalDeaths += player.deaths || 0
                    stats.totalAssists += player.assists || 0
                    stats.totalDamage += player.damageToChampions || 0
                    stats.totalGold += player.gold || 0
                    stats.totalCS += player.cs || 0
                    stats.totalVisionScore += player.visionScore || 0
                    if (player.playerWin === 'Yes') stats.wins++
                })

                // Calculer les moyennes
                const playerStats = Array.from(playerStatsMap.values()).map(stats => ({
                    name: stats.name,
                    link: stats.link,
                    team: stats.team,
                    role: stats.role,
                    gamesPlayed: stats.gamesPlayed,
                    avgKills: Math.round((stats.totalKills / stats.gamesPlayed) * 100) / 100,
                    avgDeaths: Math.round((stats.totalDeaths / stats.gamesPlayed) * 100) / 100,
                    avgAssists: Math.round((stats.totalAssists / stats.gamesPlayed) * 100) / 100,
                    kda: stats.totalDeaths === 0 
                        ? stats.totalKills + stats.totalAssists 
                        : Math.round(((stats.totalKills + stats.totalAssists) / stats.totalDeaths) * 100) / 100,
                    totalKills: stats.totalKills,
                    totalDeaths: stats.totalDeaths,
                    totalAssists: stats.totalAssists,
                    avgDamage: Math.round(stats.totalDamage / stats.gamesPlayed),
                    avgGold: Math.round(stats.totalGold / stats.gamesPlayed),
                    avgCS: Math.round((stats.totalCS / stats.gamesPlayed) * 10) / 10,
                    avgVisionScore: Math.round((stats.totalVisionScore / stats.gamesPlayed) * 10) / 10,
                    winRate: Math.round((stats.wins / stats.gamesPlayed) * 1000) / 10
                }))

                // Trier par KDA décroissant
                playerStats.sort((a, b) => b.kda - a.kda)

                const result = { players: playerStats }

                // Dynamic cache strategy based on tournament status
                let cacheTime: number

                if (!tournament?.dateEnd) {
                    // Tournament without end date = active
                    cacheTime = 300 // 5 minutes
                } else {
                    const tournamentEndDate = new Date(tournament.dateEnd)
                    const now = new Date()
                    const daysSinceEnd = Math.floor((now.getTime() - tournamentEndDate.getTime()) / (1000 * 60 * 60 * 24))
                    
                    if (tournamentEndDate > now) {
                        // Tournament not yet finished
                        cacheTime = 300 // 5 minutes
                    } else if (daysSinceEnd <= 2) {
                        // Tournament finished ≤ 2 days ago (possible corrections)
                        cacheTime = 3600 // 1 hour
                    } else if (daysSinceEnd <= 30) {
                        // Tournament finished 3-30 days ago
                        cacheTime = 604800 // 7 days
                    } else {
                        // Tournament finished > 30 days ago (historical data is fixed)
                        cacheTime = 2592000 // 30 days
                    }
                }

                await redis.setex(cacheKey, cacheTime, JSON.stringify(result))
                return result
            } catch (error) {
                console.error('Error in tournament player stats route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )


    // Player stats aggregation endpoint using tournamentId
    fastify.get<{ Params: { tournamentId: string } }>(
        '/tournaments/id/:tournamentId/player-stats',
        {
            schema: {
                description: 'Get aggregated player statistics (KDA, damage, etc.) for a tournament by ID',
                tags: ['tournaments'],
                params: TournamentIdParamSchema,
                response: {
                    200: PlayerStatsListResponse,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { tournamentId } = request.params
                const cacheKey = `tournament_player_stats_id:${tournamentId}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // Single query with include to get tournament and player data
                const tournament = await prisma.tournament.findUnique({
                    where: { id: parseInt(tournamentId) },
                    select: { 
                        dateEnd: true,
                        overviewPage: true,
                        MatchSchedule: {
                            select: {
                                MatchScheduleGame: {
                                    select: {
                                        ScoreboardPlayers: {
                                            select: {
                                                name: true,
                                                link: true,
                                                team: true,
                                                role: true,
                                                kills: true,
                                                deaths: true,
                                                assists: true,
                                                damageToChampions: true,
                                                gold: true,
                                                cs: true,
                                                visionScore: true,
                                                playerWin: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                })

                if (!tournament) {
                    return reply.status(404).send({
                        error: 'Tournament not found'
                    })
                }

                // Flatten players from all match schedule games
                const players = tournament.MatchSchedule.flatMap(schedule => 
                    schedule.MatchScheduleGame.flatMap(game => game.ScoreboardPlayers)
                )

                if (players.length === 0) {
                    return reply.status(404).send({
                        error: 'No player data found for this tournament',
                    })
                }

                // Group by player and calculate stats
                const playerStatsMap = new Map<string, any>()

                players.forEach(player => {
                    const key = `${player.name}-${player.team}-${player.role}`
                    if (!playerStatsMap.has(key)) {
                        playerStatsMap.set(key, {
                            name: player.name,
                            link: player.link,
                            team: player.team,
                            role: player.role,
                            gamesPlayed: 0,
                            totalKills: 0, 
                            totalDeaths: 0,
                            totalAssists: 0,
                            totalDamage: 0,
                            totalGold: 0,
                            totalCS: 0,
                            totalVisionScore: 0,
                            wins: 0
                        })

                    }

                    const stats = playerStatsMap.get(key)!
                    stats.gamesPlayed++
                    stats.totalKills += player.kills || 0
                    stats.totalDeaths += player.deaths || 0
                    stats.totalAssists += player.assists || 0
                    stats.totalDamage += player.damageToChampions || 0
                    stats.totalGold += player.gold || 0
                    stats.totalCS += player.cs || 0
                    stats.totalVisionScore += player.visionScore || 0
                    if (player.playerWin === 'Yes') stats.wins++
                })

                // Calculate averages
                const playerStats = Array.from(playerStatsMap.values()).map(stats => ({
                    name: stats.name,
                    link: stats.link,
                    team: stats.team,
                    role: stats.role,
                    gamesPlayed: stats.gamesPlayed,
                    avgKills: Math.round((stats.totalKills / stats.gamesPlayed) * 100) / 100,
                    avgDeaths: Math.round((stats.totalDeaths / stats.gamesPlayed) * 100) / 100,
                    avgAssists: Math.round((stats.totalAssists / stats.gamesPlayed) * 100) / 100,
                    kda: stats.totalDeaths === 0 
                        ? stats.totalKills + stats.totalAssists 
                        : Math.round(((stats.totalKills + stats.totalAssists) / stats.totalDeaths) * 100) / 100,
                    totalKills: stats.totalKills,
                    totalDeaths: stats.totalDeaths,
                    totalAssists: stats.totalAssists,
                    avgDamage: Math.round(stats.totalDamage / stats.gamesPlayed),
                    avgGold: Math.round(stats.totalGold / stats.gamesPlayed),
                    avgCS: Math.round((stats.totalCS / stats.gamesPlayed) * 10) / 10,
                    avgVisionScore: Math.round((stats.totalVisionScore / stats.gamesPlayed) * 10) / 10,
                    winRate: Math.round((stats.wins / stats.gamesPlayed) * 1000) / 10
                }))

                // Sort by KDA descending
                playerStats.sort((a, b) => b.kda - a.kda)

                const result = { players: playerStats }

                // Dynamic cache strategy based on tournament status
                let cacheTime: number

                if (!tournament?.dateEnd) {
                    // Tournament without end date = active
                    cacheTime = 300 // 5 minutes
                } else {
                    const tournamentEndDate = new Date(tournament.dateEnd)
                    const now = new Date()
                    const daysSinceEnd = Math.floor((now.getTime() - tournamentEndDate.getTime()) / (1000 * 60 * 60 * 24))
                    
                    if (tournamentEndDate > now) {
                        // Tournament not yet finished
                        cacheTime = 300 // 5 minutes
                    } else if (daysSinceEnd <= 2) {
                        // Tournament finished ≤ 2 days ago (possible corrections)
                        cacheTime = 3600 // 1 hour
                    } else if (daysSinceEnd <= 30) {
                        // Tournament finished 3-30 days ago
                        cacheTime = 604800 // 7 days
                    } else {
                        // Tournament finished > 30 days ago (historical data is fixed)
                        cacheTime = 2592000 // 30 days
                    }
                }

                await redis.setex(cacheKey, cacheTime, JSON.stringify(result))
                return result
            } catch (error) {
                console.error('Error in tournament player stats by ID route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )

    // Flexible matches route with query parameters
    fastify.get<{ 
        Params: { tournamentId: string },
        Querystring: { type?: 'next' | 'last' | 'auto', limit?: number }
    }>(
        '/tournaments/:tournamentId/matches',
        {
            schema: {
                description: 'Get matches for a tournament with flexible filtering',
                tags: ['tournaments'],
                params: TournamentIdParamSchema,
                querystring: {
                    type: 'object',
                    properties: {
                        type: { 
                            type: 'string', 
                            enum: ['next', 'last', 'auto'],
                            description: 'Type of matches to fetch: next (upcoming), last (past), auto (smart fallback)'
                        },
                        limit: { 
                            type: 'number', 
                            minimum: 0,
                            description: 'Maximum number of matches to return (0 = no limit)'
                        }
                    },
                    additionalProperties: false
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            data: MatchScheduleListResponse,
                            type: { type: 'string', enum: ['next', 'last'] },
                            total: { type: 'number', description: 'Total matches found' }
                        }
                    },
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { tournamentId } = request.params
                const { type = 'auto', limit = 3 } = request.query || {}
                
                // Create cache key that includes query parameters
                const cacheKey = `tournament_matches:${tournamentId}:${type}:${limit}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                const today = new Date()
                const takeLimit = limit === 0 ? undefined : limit

                let matches = []
                let matchType = 'next'

                if (type === 'next') {
                    // Get upcoming matches only
                    matches = await prisma.matchSchedule.findMany({
                        where: {
                            Tournament: {
                                id: parseInt(tournamentId)
                            },
                            dateTime_UTC: {
                                gte: today
                            }
                        },
                        orderBy: {
                            dateTime_UTC: 'asc'
                        },
                        take: takeLimit
                    })
                    matchType = 'next'
                } else if (type === 'last') {
                    // Get past matches only
                    matches = await prisma.matchSchedule.findMany({
                        where: {
                            Tournament: {
                                id: parseInt(tournamentId),
                            },
                            dateTime_UTC: {
                                lte: today,
                            },
                        },
                        orderBy: {
                            dateTime_UTC: 'desc',
                        },
                        take: takeLimit
                    })
                    matchType = 'last'
                } else {
                    // Auto mode: try next matches first, then last matches
                    const nextMatches = await prisma.matchSchedule.findMany({
                        where: {
                            Tournament: {
                                id: parseInt(tournamentId)
                            },
                            dateTime_UTC: {
                                gte: today
                            }
                        },
                        orderBy: {
                            dateTime_UTC: 'asc'
                        },
                        take: takeLimit
                    })

                    if (nextMatches.length > 0) {
                        matches = nextMatches
                        matchType = 'next'
                    } else {
                        // Get last matches
                        matches = await prisma.matchSchedule.findMany({
                            where: {
                                Tournament: {
                                    id: parseInt(tournamentId),
                                },
                                dateTime_UTC: {
                                    lte: today,
                                },
                            },
                            orderBy: {
                                dateTime_UTC: 'desc',
                            },
                            take: takeLimit
                        })
                        matchType = 'last'
                    }
                }

                if (matches.length === 0) {
                    return reply.status(404).send({
                        error: `No ${type === 'auto' ? '' : type + ' '}matches found for this tournament`,
                    })
                }

                const result = { 
                    data: matches, 
                    type: matchType,
                    total: matches.length
                }
                
                // Dynamic cache time based on type
                const cacheTime = matchType === 'next' ? 1800 : 3600 // 30min for upcoming, 1h for past
                await redis.setex(cacheKey, cacheTime, JSON.stringify(result))
                return result

            } catch (error) {
                console.error('Error in tournament matches route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )

    // Debug route to list all tournaments
    fastify.get(
        '/tournaments/debug/list',
        {
            schema: {
                description: 'Debug route to list all tournaments',
                tags: ['tournaments'],
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            tournaments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        name: { type: 'string' },
                                        overviewPage: { type: 'string' },
                                        league: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const tournaments = await prisma.tournament.findMany({
                    select: {
                        id: true,
                        name: true,
                        overviewPage: true,
                        league: true,
                    },
                    orderBy: { name: 'asc' },
                })

                return { tournaments }
            } catch (error) {
                console.error('Error in debug route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )
}
