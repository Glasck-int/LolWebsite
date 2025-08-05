import { FastifyInstance } from 'fastify'
import { ErrorResponseSchema } from '../../schemas/common'
import {
    TournamentChampionStatsResponseSchema,
    PlayerChampionStatsResponseSchema,
    TeamChampionStatsResponseSchema
} from '../../schemas/champions'
import {
    TournamentParamSchema,
    PlayerNameParamSchema,
    PlayerTournamentParamsSchema,
    TeamParamSchema,
    TeamTournamentCombinedParamsSchema
} from '../../schemas/params'
import { ChampionStatsService } from '../../services/championStatsService'
import { CleanName } from '../../utils/cleanName'

export default async function championsRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis
    const customMetric = new fastify.metrics.client.Counter({
        name: 'champion_stats_requests',
        help: 'Champion statistics requests',
        labelNames: ['operation'],
    })


    // 1. GET /champions/stats/tournament/:tournament - all champion stats for a tournament
    fastify.get<{ Params: { tournament: string } }>(
        '/champions/stats/tournament/:tournament',
        {
            schema: {
                description: 'Get all champion statistics for a specific tournament',
                tags: ['champions'],
                params: TournamentParamSchema,
                response: {
                    200: TournamentChampionStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { tournament } = request.params
            const cacheKey = `champions:tournament:${tournament}`
            customMetric.inc({ operation: 'get_tournament_champion_stats' })

            try {
                const result = await ChampionStatsService.getChampionStats(
                    { tournament },
                    {
                        cacheKey,
                        cacheTTL: 21600, // 6 hours
                        redis,
                        includePickRate: true,
                        includePresenceRate: true
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No champion data found for tournament ${tournament}`
                    })
                }

                return result
            } catch (error) {
                console.error('Error fetching tournament champion stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )

    // 2. GET /champions/stats/player/:player/tournament/:tournament - champion stats for specific player in tournament
    fastify.get<{ Params: { player: string; tournament: string } }>(
        '/champions/stats/player/:player/tournament/:tournament',
        {
            schema: {
                description: 'Get champion statistics for a specific player in a tournament',
                tags: ['champions'],
                params: PlayerTournamentParamsSchema,
                response: {
                    200: PlayerChampionStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { player, tournament } = request.params
            const cacheKey = `champions:player:${player}:tournament:${tournament}`
            customMetric.inc({ operation: 'get_player_tournament_champion_stats' })

            try {
                const result = await ChampionStatsService.getChampionStats(
                    { player, tournament },
                    {
                        cacheKey,
                        cacheTTL: 21600, // 6 hours
                        redis,
                        includePickRate: false,
                        includePresenceRate: false
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No champion data found for player ${player} in tournament ${tournament}`
                    })
                }

                return result
            } catch (error) {
                console.error('Error fetching player tournament champion stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )

    // 3. GET /champions/stats/player/:player - champion stats for specific player across all tournaments
    fastify.get<{ Params: { player: string } }>(
        '/champions/stats/player/:player',
        {
            schema: {
                description: 'Get champion statistics for a specific player across all tournaments',
                tags: ['champions'],
                params: PlayerNameParamSchema,
                response: {
                    200: PlayerChampionStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { player } = request.params
            const cacheKey = `champions:player:${player}:all`
            customMetric.inc({ operation: 'get_player_all_champion_stats' })

            try {
                const result = await ChampionStatsService.getChampionStats(
                    { player },
                    {
                        cacheKey,
                        cacheTTL: 43200, // 12 hours - career stats change less frequently
                        redis,
                        includePickRate: false,
                        includePresenceRate: false
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No champion data found for player ${player}`
                    })
                }

                return result
            } catch (error) {
                console.error('Error fetching player all champion stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )

    // 4. GET /champions/stats/team/:team/tournament/:tournament - champion stats for team in tournament
    fastify.get<{ Params: { team: string; tournament: string } }>(
        '/champions/stats/team/:team/tournament/:tournament',
        {
            schema: {
                description: 'Get champion statistics for a specific team in a tournament',
                tags: ['champions'],
                params: TeamTournamentCombinedParamsSchema,
                response: {
                    200: TeamChampionStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { team, tournament } = request.params
            const cacheKey = `champions:team:${team}:tournament:${tournament}`
            customMetric.inc({ operation: 'get_team_tournament_champion_stats' })

            try {
                const result = await ChampionStatsService.getChampionStats(
                    { team, tournament },
                    {
                        cacheKey,
                        cacheTTL: 21600, // 6 hours
                        redis,
                        includePickRate: false,
                        includePresenceRate: false
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No champion data found for team ${team} in tournament ${tournament}`
                    })
                }

                // Apply team name cleaning to the result
                return {
                    ...result,
                    team: CleanName(team)
                }
            } catch (error) {
                console.error('Error fetching team tournament champion stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )

    // 5. GET /champions/stats/team/:team - champion stats for team across all tournaments
    fastify.get<{ Params: { team: string } }>(
        '/champions/stats/team/:team',
        {
            schema: {
                description: 'Get champion statistics for a specific team across all tournaments',
                tags: ['champions'],
                params: TeamParamSchema,
                response: {
                    200: TeamChampionStatsResponseSchema,
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            const { team } = request.params
            const cacheKey = `champions:team:${team}:all`
            customMetric.inc({ operation: 'get_team_all_champion_stats' })

            try {
                const result = await ChampionStatsService.getChampionStats(
                    { team },
                    {
                        cacheKey,
                        cacheTTL: 43200, // 12 hours - career stats change less frequently
                        redis,
                        includePickRate: false,
                        includePresenceRate: false
                    }
                )

                if (!result) {
                    return reply.status(404).send({
                        error: `No champion data found for team ${team}`
                    })
                }

                // Apply team name cleaning to the result
                return {
                    ...result,
                    team: CleanName(team)
                }
            } catch (error) {
                console.error('Error fetching team all champion stats:', error)
                return reply.status(500).send({ error: 'Internal server error' })
            }
        }
    )
}