import { FastifyInstance } from 'fastify'
import { ErrorResponseSchema } from '../../schemas/common'
import {
    TournamentPlayerStatsResponseSchema,
    PlayerStatsResponseSchema,
    TeamPlayerStatsResponseSchema
} from '../../schemas/players'
import {
    TournamentParamSchema,
    PlayerNameParamSchema,
    PlayerTournamentParamsSchema,
    TeamParamSchema,
    TeamTournamentCombinedParamsSchema
} from '../../schemas/params'
import { PlayerStatsService } from '../../services/playerStatsService'
import { CleanName } from '../../utils/cleanName'

export default async function playerStatsRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis
    const customMetric = new fastify.metrics.client.Counter({
        name: 'player_stats_requests',
        help: 'Player statistics requests',
        labelNames: ['operation'],
    })

    // 1. GET /players/stats/tournament/:tournament - all player stats for a tournament
    fastify.get<{ Params: { tournament: string } }>(
        '/players/stats/tournament/:tournament',
        {
            schema: {
                description: 'Get all player statistics for a specific tournament',
                tags: ['players', 'statistics'],
                params: TournamentParamSchema,
                response: {
                    200: TournamentPlayerStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { tournament } = request.params
            const cacheKey = `players:stats:tournament:${tournament}`
            customMetric.inc({ operation: 'get_tournament_player_stats' })

            try {
                const result = await PlayerStatsService.getPlayerStats(
                    { tournament },
                    {
                        cacheKey,
                        cacheTTL: 21600, // 6 hours
                        redis
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No player data found for tournament ${tournament}`
                    })
                }

                return result
            } catch (error) {
                console.error('Error fetching tournament player stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )

    // 2. GET /players/stats/player/:player/tournament/:tournament - stats for specific player in tournament
    fastify.get<{ Params: { player: string; tournament: string } }>(
        '/players/stats/player/:player/tournament/:tournament',
        {
            schema: {
                description: 'Get statistics for a specific player in a tournament',
                tags: ['players', 'statistics'],
                params: PlayerTournamentParamsSchema,
                response: {
                    200: PlayerStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { player, tournament } = request.params
            const cacheKey = `players:stats:player:${player}:tournament:${tournament}`
            customMetric.inc({ operation: 'get_player_tournament_stats' })

            try {
                const result = await PlayerStatsService.getPlayerStats(
                    { player, tournament },
                    {
                        cacheKey,
                        cacheTTL: 21600, // 6 hours
                        redis
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No data found for player ${player} in tournament ${tournament}`
                    })
                }

                return result
            } catch (error) {
                console.error('Error fetching player tournament stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )

    // 3. GET /players/stats/player/:player - stats for specific player across all tournaments
    fastify.get<{ Params: { player: string } }>(
        '/players/stats/player/:player',
        {
            schema: {
                description: 'Get statistics for a specific player across all tournaments',
                tags: ['players', 'statistics'],
                params: PlayerNameParamSchema,
                response: {
                    200: PlayerStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { player } = request.params
            const cacheKey = `players:stats:player:${player}:all`
            customMetric.inc({ operation: 'get_player_all_stats' })

            try {
                const result = await PlayerStatsService.getPlayerStats(
                    { player },
                    {
                        cacheKey,
                        cacheTTL: 43200, // 12 hours - career stats change less frequently
                        redis
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No data found for player ${player}`
                    })
                }

                return result
            } catch (error) {
                console.error('Error fetching player all stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )

    // 4. GET /players/stats/team/:team/tournament/:tournament - player stats for team in tournament
    fastify.get<{ Params: { team: string; tournament: string } }>(
        '/players/stats/team/:team/tournament/:tournament',
        {
            schema: {
                description: 'Get player statistics for a specific team in a tournament',
                tags: ['players', 'statistics'],
                params: TeamTournamentCombinedParamsSchema,
                response: {
                    200: TeamPlayerStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { team, tournament } = request.params
            const cacheKey = `players:stats:team:${team}:tournament:${tournament}`
            customMetric.inc({ operation: 'get_team_tournament_player_stats' })

            try {
                const result = await PlayerStatsService.getPlayerStats(
                    { team, tournament },
                    {
                        cacheKey,
                        cacheTTL: 21600, // 6 hours
                        redis
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No player data found for team ${team} in tournament ${tournament}`
                    })
                }

                // Apply team name cleaning to the result
                return {
                    ...result,
                    team: CleanName(team)
                }
            } catch (error) {
                console.error('Error fetching team tournament player stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )

    // 5. GET /players/stats/team/:team - player stats for team across all tournaments
    fastify.get<{ Params: { team: string } }>(
        '/players/stats/team/:team',
        {
            schema: {
                description: 'Get player statistics for a specific team across all tournaments',
                tags: ['players', 'statistics'],
                params: TeamParamSchema,
                response: {
                    200: TeamPlayerStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { team } = request.params
            const cacheKey = `players:stats:team:${team}:all`
            customMetric.inc({ operation: 'get_team_all_player_stats' })

            try {
                const result = await PlayerStatsService.getPlayerStats(
                    { team },
                    {
                        cacheKey,
                        cacheTTL: 43200, // 12 hours - career stats change less frequently
                        redis
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No player data found for team ${team}`
                    })
                }

                // Apply team name cleaning to the result
                return {
                    ...result,
                    team: CleanName(team)
                }
            } catch (error) {
                console.error('Error fetching team all player stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )
}