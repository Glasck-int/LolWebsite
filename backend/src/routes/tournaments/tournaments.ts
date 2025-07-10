import { FastifyInstance } from 'fastify'

import {
    TournamentListResponse,
    TournamentStandingsListResponse,
} from '../../schemas/tournaments'
import { ErrorResponseSchema } from '../../schemas/common'
import prisma from '../../services/prisma'

export default async function tournamentsRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis
    const customMetric = new fastify.metrics.client.Counter({
        name: 'tournaments_by_league_name',
        help: 'Tournaments by league name',
        labelNames: ['operation'],
    })

    fastify.get<{ Params: { leagueName: string } }>(
        '/tournaments/league/:leagueName',
        {
            schema: {
                description: 'Get tournaments by league id',
                tags: ['tournaments'],
                response: {
                    200: TournamentListResponse,
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

                console.log(
                    'Looking for tournament with overviewPage:',
                    decodedOverviewPage
                )

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

    // fastify.get<{ Params: { tournamentId: string } }>(
    //     '/tournaments/id/:tournamentId/games',
    //     {
    //         schema: {
    //             description: 'Get games for a tournament by tournament ID',
    //             tags: ['tournaments'],
    //             response: {
    //                 200: TournamentGamesListResponse,
    //                 404: ErrorResponseSchema,
    //                 500: ErrorResponseSchema,
    //             },
    //         },
    //     },
    //     async (request, reply) => {
    //         try {
    //             const { tournamentId } = request.params
    //             const games = await prisma.game.findMany({
    //                 where: { tournamentId: parseInt(tournamentId) },
    //             })
    //             return games
    //         } catch (error) {
    //             console.error('Error in tournament games route:', error)
    //             return reply
    //                 .status(500)
    //                 .send({ error: 'Internal server error' })
    //         }
    //     }
    // )

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
