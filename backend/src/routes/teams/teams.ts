import { FastifyInstance } from 'fastify'
import { TeamSchema } from '../../schemas/teams'
import { ErrorResponseSchema } from '../../schemas/common'
import { MatchScheduleSchema } from '../../schemas/matchShedule'
import prisma from '../../services/prisma'
import { MatchScheduleGameListResponse } from '../../schemas/matchScheduleGame'
import {
    TeamNameParamSchema,
    TeamTournamentParamsSchema,
} from '../../schemas/params'

export default async function teamsRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis
    const customMetric = new fastify.metrics.client.Counter({
        name: 'teams_by_name',
        help: 'Teams by name',
        labelNames: ['operation'],
    })

    fastify.get<{ Params: { name: string } }>(
        '/teams/name/:name',
        {
            schema: {
                description: 'Get a team by name',
                tags: ['teams'],
                params: TeamNameParamSchema,
                response: {
                    200: TeamSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { name } = request.params
            const cacheKey = `team:name:${name}`
            customMetric.inc({ operation: 'get_team_by_name' })
            
            // Temporary: skip cache to force fresh data with latestLeague
            console.log(`🗑️ [TEAM API] Skipping cache for team "${name}" to get fresh data with latestLeague`)
            // const cached = await redis.get(cacheKey)
            // if (cached) {
            //     return JSON.parse(cached)
            // }
            const team = await prisma.team.findUnique({
                where: { overviewPage: name },
            })

            if (!team) {
                return reply.status(404).send({ error: 'Team not found' })
            }

            // Get the latest league for this team
            let latestLeague = null
            try {
                console.log(`🔎 [TEAM API] Searching tournaments for team.overviewPage: "${team.overviewPage}"`)
                
                const latestTournament = await prisma.tournament.findFirst({
                    where: {
                        Standings: {
                            some: {
                                team: team.overviewPage,
                            }
                        },
                        league: {
                            not: null,
                        }
                    },
                    include: {
                        League: true,
                    },
                    orderBy: [
                        { dateEnd: 'desc' },
                        { dateStart: 'desc' },
                        { id: 'desc' },
                    ],
                })

                console.log(`🔎 [TEAM API] Query result for "${name}": ${latestTournament ? 'Tournament found' : 'No tournament found'}`)

                if (latestTournament?.League) {
                    latestLeague = {
                        id: latestTournament.League.id,
                        name: latestTournament.League.name,
                        short: latestTournament.League.short,
                        region: latestTournament.League.region,
                        level: latestTournament.League.level,
                        isOfficial: latestTournament.League.isOfficial,
                        isMajor: latestTournament.League.isMajor,
                    }
                    
                    console.log(`🔍 [TEAM API] Latest league found for team "${name}":`, {
                        tournamentName: latestTournament.name,
                        tournamentDate: latestTournament.dateEnd || latestTournament.dateStart,
                        leagueId: latestTournament.League.id,
                        leagueName: latestTournament.League.name,
                        leagueShort: latestTournament.League.short,
                        leagueRegion: latestTournament.League.region
                    })
                } else {
                    console.log(`❌ [TEAM API] No league found for team "${name}" - latestTournament:`, latestTournament ? 'exists but no League' : 'not found')
                }
            } catch (error) {
                console.error('Error fetching latest league for team:', error)
            }

            const cleanedTeam = {
                ...team,
                name: team.name,
                latestLeague
            }

            console.log(`📤 [TEAM API] Returning team data for "${name}":`, {
                teamId: team.id,
                teamName: team.name,
                hasLatestLeague: !!latestLeague,
                latestLeagueShort: latestLeague?.short || 'N/A',
                latestLeagueName: latestLeague?.name || 'N/A'
            })
            
            console.log(`🔧 [TEAM API] Full cleanedTeam object:`, JSON.stringify(cleanedTeam, null, 2))

            // Temporary: skip cache completely to avoid any interference
            console.log(`🚫 [TEAM API] Skipping cache write for team "${name}" - returning fresh data directly`)
            // await redis.setex(cacheKey, 604800, JSON.stringify(cleanedTeam))
            return cleanedTeam
        }
    )

    fastify.get<{
        Params: { name: string; tournament: string }
    }>(
        '/teams/name/:name/tournament/:tournament/recent-matches',
        {
            schema: {
                description:
                    'Get the 5 most recent matches for a team in a specific tournament with win/loss status',
                tags: ['teams'],
                params: TeamTournamentParamsSchema,
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            team: { type: 'string' },
                            tournament: { type: 'string' },
                            recentMatches: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        matchId: { type: 'string' },
                                        dateTime_UTC: { type: 'string' },
                                        team1: { type: 'string' },
                                        team2: { type: 'string' },
                                        winner: { type: 'string' },
                                        team1Score: { type: 'number' },
                                        team2Score: { type: 'number' },
                                        isWin: { type: 'boolean' },
                                        opponent: { type: 'string' },
                                        tournament: { type: 'string' },
                                    },
                                },
                            },
                            form: { type: 'string' }, // String like "WWLLW" representing last 5 matches
                        },
                    },
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { name, tournament } = request.params
            const cacheKey = `team:recent-matches:${name}:${tournament}`
            customMetric.inc({
                operation: 'get_team_recent_matches_tournament',
            })

            const cached = await redis.get(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }

            // Find matches where the team participated in the specific tournament
            const recentMatches = await prisma.matchSchedule.findMany({
                where: {
                    OR: [{ team1: name }, { team2: name }],
                    overviewPage: tournament, // Filter by specific tournament
                    winner: {
                        not: null,
                    },
                    dateTime_UTC: {
                        not: null,
                    },
                },
                orderBy: {
                    dateTime_UTC: 'desc',
                },
                take: 5,
                select: {
                    matchId: true,
                    dateTime_UTC: true,
                    team1: true,
                    team2: true,
                    winner: true,
                    team1Score: true,
                    team2Score: true,
                    overviewPage: true, // tournament name
                },
            })
            if (recentMatches.length === 0) {
                return reply.status(404).send({
                    error: `No recent matches found for team ${name} in tournament ${tournament}`,
                })
            }

            // Process matches to determine win/loss status
            const processedMatches = recentMatches.map((match) => {
                const isTeam1 = match.team1 === name
                const opponent = isTeam1 ? match.team2 : match.team1

                let isWin = false
                if (match.winner === '1') {
                    isWin = match.team1 === name
                } else if (match.winner === '2') {
                    isWin = match.team2 === name
                }

                return {
                    matchId: match.matchId,
                    dateTime_UTC: match.dateTime_UTC?.toISOString(),
                    team1: match.team1,
                    team2: match.team2,
                    winner: match.winner,
                    team1Score: match.team1Score,
                    team2Score: match.team2Score,
                    isWin,
                    opponent: opponent || 'Unknown',
                    tournament: match.overviewPage,
                }
            })

            // Create form string (W for win, L for loss)
            const form = processedMatches
                .map((match) => (match.isWin ? 'W' : 'L'))
                .join('')

            const result = {
                team: name,
                tournament: tournament,
                recentMatches: processedMatches, // ← Changer "matches" en "recentMatches"
                form,
            }
            // console.log(result.matches[0].team1 + 'yes')
            // Cache for 1 hour (3600 seconds) since match results change frequently
            await redis.setex(cacheKey, 3600, JSON.stringify(result))
            return result
        }
    )

    fastify.get<{
        Params: { name: string; tournament: string }
    }>(
        '/teams/name/:name/tournament/:tournament/recent-games',
        {
            schema: {
                description:
                    'Get the 5 most recent games for a team in a specific tournament with win/loss status',
                tags: ['teams'],
                params: TeamTournamentParamsSchema,
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            team: { type: 'string' },
                            tournament: { type: 'string' },
                            recentGames: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        gameId: { type: 'string' },
                                        matchId: { type: 'string' },
                                        blue: { type: 'string' },
                                        red: { type: 'string' },
                                        winner: { type: 'number' },
                                        blueScore: { type: 'number' },
                                        redScore: { type: 'number' },
                                        isWin: { type: 'boolean' },
                                        opponent: { type: 'string' },
                                        tournament: { type: 'string' },
                                        nGameInMatch: { type: 'number' },
                                    },
                                },
                            },
                            form: { type: 'string' }, // String like "WWLLW" representing last 5 games
                        },
                    },
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { name, tournament } = request.params
            const cacheKey = `team:recent-games:${name}:${tournament}`
            customMetric.inc({
                operation: 'get_team_recent_games_tournament',
            })

            const cached = await redis.get(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }

            // Find games where the team participated in the specific tournament
            const recentGames = await prisma.matchScheduleGame.findMany({
                where: {
                    OR: [{ blue: name }, { red: name }],
                    overviewPage: tournament, // Filter by specific tournament
                    winner: {
                        not: null,
                    },
                    MatchSchedule: {
                        dateTime_UTC: {
                            not: null,
                        },
                    },
                },
                select: {
                    gameId: true,
                    matchId: true,
                    blue: true,
                    red: true,
                    winner: true,
                    blueScore: true,
                    redScore: true,
                    nGameInMatch: true,
                    MatchSchedule: {
                        select: {
                            dateTime_UTC: true,
                            overviewPage: true,
                        },
                    },
                },
                orderBy: {
                    MatchSchedule: {
                        dateTime_UTC: 'desc',
                    },
                },
                take: 5,
            })

            if (recentGames.length === 0) {
                return reply.status(404).send({
                    error: `No recent games found for team ${name} in tournament ${tournament}`,
                })
            }

            // Process games to determine win/loss status
            const processedGames = recentGames.map((game) => {
                const isBlueTeam = game.blue === name
                const opponent = isBlueTeam ? game.red : game.blue

                let isWin = false
                if (game.winner === 1) {
                    isWin = game.blue === name
                } else if (game.winner === 2) {
                    isWin = game.red === name
                }

                return {
                    gameId: game.gameId,
                    matchId: game.matchId,
                    blue: game.blue,
                    red: game.red,
                    winner: game.winner,
                    blueScore: game.blueScore,
                    redScore: game.redScore,
                    isWin,
                    opponent: opponent || 'Unknown',
                    tournament: game.MatchSchedule?.overviewPage,
                    nGameInMatch: game.nGameInMatch,
                }
            })

            // Create form string (W for win, L for loss)
            const form = processedGames
                .map((game) => (game.isWin ? 'W' : 'L'))
                .join('')

            const result = {
                team: name,
                tournament: tournament,
                recentGames: processedGames,
                form,
            }

            // Cache for 1 hour (3600 seconds) since game results change frequently
            await redis.setex(cacheKey, 3600, JSON.stringify(result))
            return result
        }
    )

    fastify.get<{ Params: { name: string; tournament: string } }>(
        '/teams/name/:name/tournament/:tournament/games',
        {
            schema: {
                description:
                    'Get all match schedule games for a team in a specific tournament',
                tags: ['teams'],
                params: TeamTournamentParamsSchema,
                response: {
                    200: MatchScheduleGameListResponse,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { name, tournament } = request.params
                const cacheKey = `team:games:${name}:${tournament}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // Single query with relations
                const tournamentWithGames = await prisma.tournament.findUnique({
                    where: { overviewPage: tournament },
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
}
