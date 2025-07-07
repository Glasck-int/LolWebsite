import { FastifyInstance } from 'fastify'
import { TeamSchema } from '../../schemas/teams'
import { ErrorResponseSchema } from '../../schemas/common'
import { MatchScheduleSchema } from '../../schemas/matchShedule'
import prisma from '../../services/prisma'

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
            const cached = await redis.get(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }
            const team = await prisma.team.findUnique({
                where: { overviewPage: name },
            })

            if (!team) {
                return reply.status(404).send({ error: 'Team not found' })
            }

            // Cache for 1 week (604800 seconds)
            await redis.setex(cacheKey, 604800, JSON.stringify(team))
            return team
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
                matches: recentMatches,
                form,
            }
            console.log(result.matches)
            // Cache for 1 hour (3600 seconds) since match results change frequently
            await redis.setex(cacheKey, 3600, JSON.stringify(result))
            return result
        }
    )
}
