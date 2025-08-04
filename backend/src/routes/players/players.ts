import { FastifyInstance } from 'fastify'

import prisma from '../../services/prisma'
import { 
    PlayerListResponse, 
    PlayerSchema, 
    PlayerWithRedirectsSchema,
    PlayerRedirectListResponse,
    PlayerImageListResponse
} from '../../schemas/players'
import { resolvePlayer, PlayerNotFoundError } from '../../utils/playerUtils'

export default async function playersRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis
    const customMetric = new fastify.metrics.client.Counter({
        name: 'players',
        help: 'Players',
        labelNames: ['operation'],
    })

    // Get all players
    fastify.get('/players', {
        schema: {
            description: 'Get all players',
            tags: ['players'],
            response: {
                200: PlayerListResponse,
            },
        },
    }, async (request, reply) => {
        try {
            customMetric.inc({ operation: 'get_all_players' })
            const players = await prisma.player.findMany()
            return players
        } catch (error) {
            fastify.log.error(error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Get player by name (with intelligent redirect)
    fastify.get('/players/name/:playerName', {
        schema: {
            description: 'Get player by name (supports redirects/aliases)',
            tags: ['players'],
            params: {
                type: 'object',
                properties: {
                    playerName: {
                        type: 'string',
                        description: 'Player name or alias',
                        examples: ['Caps', 'Rasmus Winther', 'G2 Caps']
                    }
                },
                required: ['playerName']
            },
            response: {
                200: PlayerWithRedirectsSchema,
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
        },
    }, async (request, reply) => {
        try {
            const { playerName } = request.params as { playerName: string }
            customMetric.inc({ operation: 'get_player_by_name' })

            // Use the player utility to resolve the player with all data
            const resolution = await resolvePlayer(playerName, {
                includePlayer: true,
                includeRedirects: true,
                includeImages: true
            })

            // Format response to match schema
            const response = {
                ...resolution.player,
                redirects: resolution.redirects,
                images: resolution.images
            }

            return response
        } catch (error) {
            if (error instanceof PlayerNotFoundError) {
                return reply.status(404).send({ error: 'Player not found' })
            }
            fastify.log.error(error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Get player by overview page (direct access)
    fastify.get('/players/overview/:overviewPage', {
        schema: {
            description: 'Get player by overview page identifier',
            tags: ['players'],
            params: {
                type: 'object',
                properties: {
                    overviewPage: {
                        type: 'string',
                        description: 'Player overview page identifier',
                        examples: ['Caps', 'Faker', 'Jankos']
                    }
                },
                required: ['overviewPage']
            },
            response: {
                200: PlayerWithRedirectsSchema,
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
        },
    }, async (request, reply) => {
        try {
            const { overviewPage } = request.params as { overviewPage: string }
            customMetric.inc({ operation: 'get_player_by_overview' })

            const player = await prisma.player.findUnique({
                where: { overviewPage },
                include: {
                    PlayerRedirect: {
                        include: {
                            PlayerImage: true
                        }
                    }
                }
            })

            if (!player) {
                return reply.status(404).send({ error: 'Player not found' })
            }

            // Collect all images from all redirects
            const allImages = player.PlayerRedirect.flatMap(redirect => redirect.PlayerImage || [])

            const response = {
                ...player,
                redirects: player.PlayerRedirect,
                images: allImages
            }

            return response
        } catch (error) {
            fastify.log.error(error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Get all player redirects
    fastify.get('/players/redirects', {
        schema: {
            description: 'Get all player redirects/aliases',
            tags: ['players'],
            response: {
                200: PlayerRedirectListResponse,
            },
        },
    }, async (request, reply) => {
        try {
            customMetric.inc({ operation: 'get_all_redirects' })
            const redirects = await prisma.playerRedirect.findMany()
            return redirects
        } catch (error) {
            fastify.log.error(error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Search players by name (fuzzy search)
    fastify.get('/players/search/:searchTerm', {
        schema: {
            description: 'Search players by name (fuzzy search)',
            tags: ['players'],
            params: {
                type: 'object',
                properties: {
                    searchTerm: {
                        type: 'string',
                        description: 'Search term for player name',
                        examples: ['cap', 'fake', 'jank']
                    }
                },
                required: ['searchTerm']
            },
            response: {
                200: PlayerRedirectListResponse,
            },
        },
    }, async (request, reply) => {
        try {
            const { searchTerm } = request.params as { searchTerm: string }
            customMetric.inc({ operation: 'search_players' })

            // Search in player redirects for partial matches
            const redirects = await prisma.playerRedirect.findMany({
                where: {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive'
                    }
                },
                take: 10 // Limit results
            })

            return redirects
        } catch (error) {
            fastify.log.error(error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Get player images by player name
    fastify.get('/players/name/:playerName/images', {
        schema: {
            description: 'Get all images for a player by name',
            tags: ['players'],
            params: {
                type: 'object',
                properties: {
                    playerName: {
                        type: 'string',
                        description: 'Player name or alias',
                        examples: ['Caps', 'Rasmus Winther', 'G2 Caps']
                    }
                },
                required: ['playerName']
            },
            response: {
                200: PlayerImageListResponse,
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
        },
    }, async (request, reply) => {
        try {
            const { playerName } = request.params as { playerName: string }
            customMetric.inc({ operation: 'get_player_images' })

            // Use the player utility to resolve the player and get images
            const resolution = await resolvePlayer(playerName, {
                includeImages: true
            })

            return resolution.images
        } catch (error) {
            if (error instanceof PlayerNotFoundError) {
                return reply.status(404).send({ error: 'Player not found' })
            }
            fastify.log.error(error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Get all player images
    fastify.get('/players/images', {
        schema: {
            description: 'Get all player images',
            tags: ['players'],
            response: {
                200: PlayerImageListResponse,
            },
        },
    }, async (request, reply) => {
        try {
            customMetric.inc({ operation: 'get_all_player_images' })
            const images = await prisma.playerImage.findMany()
            return images
        } catch (error) {
            fastify.log.error(error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })
}