import { FastifyInstance } from 'fastify'

import prisma from '../../services/prisma'
import { 
    PlayerListResponse, 
    PlayerSchema, 
    PlayerWithRedirectsSchema,
    PlayerRedirectListResponse,
    PlayerImageListResponse
} from '../../schemas/players'
import { PlayerNameSeasonsParamSchema } from '../../schemas/params'
import { resolvePlayer, PlayerNotFoundError } from '../../utils/playerUtils'

// Redis cache TTL for player images (5 minutes)
const REDIS_CACHE_TTL = 300

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
            
            // Clean player names in the response
            const cleanedPlayers = players.map(player => ({
                ...player,
                name: player.name
            }))
            
            return cleanedPlayers
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

            // Check if player was found
            if (!resolution.player) {
                return reply.status(404).send({ error: 'Player not found' })
            }

            // Format response to match schema with cleaned names
            const response = {
                ...resolution.player,
                name: resolution.player.name, 
                redirects: resolution.redirects?.map(redirect => ({
                    ...redirect,
                    name: redirect.name
                })),
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
                name: player.name,
                redirects: player.PlayerRedirect.map(redirect => ({
                    ...redirect,
                    name: redirect.name
                })),
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
            
            // Clean player names in the redirects
            const cleanedRedirects = redirects.map(redirect => ({
                ...redirect,
                name: redirect.name
            }))
            
            return cleanedRedirects
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

            // Search in player redirects for partial matches (case-sensitive)
            const redirects = await prisma.playerRedirect.findMany({
                where: {
                    name: {
                        contains: searchTerm
                    }
                },
                take: 10 // Limit results
            })

            // Clean player names in the search results
            const cleanedRedirects = redirects.map(redirect => ({
                ...redirect,
                name: redirect.name
            }))

            return cleanedRedirects
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

    // Get best player image for specific tournament based on temporal proximity
    fastify.get('/players/name/:playerName/tournament/:tournamentName/image', {
        schema: {
            description: 'Get best matching player image for a specific tournament based on dates',
            tags: ['players'],
            params: {
                type: 'object',
                properties: {
                    playerName: {
                        type: 'string',
                        description: 'Player name or alias',
                        examples: ['Caps', 'Rasmus Winther', 'G2 Caps']
                    },
                    tournamentName: {
                        type: 'string',
                        description: 'Tournament name/identifier',
                        examples: ['LEC 2024 Spring', 'LEC_2024_Spring']
                    }
                },
                required: ['playerName', 'tournamentName']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        fileName: { type: 'string' },
                        link: { type: 'string' },
                        team: { type: 'string', nullable: true },
                        tournament: { type: 'string', nullable: true },
                        imageType: { type: 'string', nullable: true },
                        caption: { type: 'string', nullable: true },
                        isProfileImage: { type: 'boolean', nullable: true },
                        priority: { type: 'number' },
                        reason: { type: 'string' },
                        tournamentDate: { type: 'string', nullable: true },
                        daysDifference: { type: 'number', nullable: true }
                    }
                },
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
            const { playerName, tournamentName } = request.params as { playerName: string, tournamentName: string }
            customMetric.inc({ operation: 'get_player_tournament_image' })

            // First verify the player exists - try PlayerRedirect first, then Player table directly
            let playerCheck = await prisma.playerRedirect.findUnique({
                where: { name: playerName }
            })
            
            let playerOverviewPage: string
            
            if (!playerCheck) {                
                // Try to find in Player table directly by overviewPage (case sensitive)
                let playerDirect = await prisma.player.findFirst({
                    where: { 
                        overviewPage: playerName
                    }
                })
                
                if (!playerDirect) {
                    return reply.status(404).send({ error: 'Player not found' })
                }
                
                playerOverviewPage = playerDirect.overviewPage
            } else {
                playerOverviewPage = playerCheck.overviewPage
            }
            
            // First get the target tournament and its dates
            // Try to find by overviewPage first, then by ID if it's numeric
            let targetTournament = await prisma.tournament.findUnique({
                where: { overviewPage: tournamentName },
                select: {
                    overviewPage: true,
                    dateStart: true,
                    dateEnd: true,
                    name: true
                }
            })


            // If not found and tournamentName is numeric, try finding by ID
            if (!targetTournament && /^\d+$/.test(tournamentName)) {
                const tournamentId = parseInt(tournamentName)
                targetTournament = await prisma.tournament.findUnique({
                    where: { id: tournamentId },
                    select: {
                        overviewPage: true,
                        dateStart: true,
                        dateEnd: true,
                        name: true
                    }
                })
            }

            if (!targetTournament) {
                return reply.status(404).send({ error: 'Tournament not found' })
            }


            // Use the player utility to resolve the player and get images with tournament data
            const resolution = await resolvePlayer(playerName, {
                includePlayer: true,
                includeImages: true
            })

            
            if (!resolution.player) {
                return reply.status(404).send({ error: 'Player not found' })
            }

            if (!resolution.images || resolution.images.length === 0) {
                return reply.status(404).send({ error: 'No images found for player' })
            }



            // Get all tournaments that have images for this player to calculate date proximity
            const tournamentsWithImages = await prisma.tournament.findMany({
                where: {
                    overviewPage: {
                        in: resolution.images
                            .map(img => img.tournament)
                            .filter(t => t !== null) as string[]
                    }
                },
                select: {
                    overviewPage: true,
                    dateStart: true,
                    dateEnd: true,
                    name: true
                }
            })

            // Create a map for quick tournament date lookup
            const tournamentDateMap = new Map(
                tournamentsWithImages.map(t => [
                    t.overviewPage, 
                    { 
                        dateStart: t.dateStart, 
                        dateEnd: t.dateEnd, 
                        name: t.name 
                    }
                ])
            )

            // Calculate target tournament reference date (use dateStart or dateEnd, prefer dateStart)
            const targetDate = targetTournament.dateStart || targetTournament.dateEnd
            if (!targetDate) {
                // If target tournament has no dates, fall back to name matching
                return reply.status(404).send({ error: 'Target tournament has no date information' })
            }

            // Prioritize images based on temporal proximity and other factors
            const imagesWithPriority = resolution.images.map(image => {
                let priority = 0
                let reason = ''
                let daysDifference: number | null = null
                let tournamentDate: Date | null = null

                // Exact tournament match gets highest priority
                if (image.tournament === tournamentName) {
                    priority = 1000
                    reason = 'Exact tournament match'
                    tournamentDate = targetDate
                    daysDifference = 0
                } else if (image.tournament) {
                    // Check if we have date information for this image's tournament
                    const imageTournamentData = tournamentDateMap.get(image.tournament)
                    if (imageTournamentData && (imageTournamentData.dateStart || imageTournamentData.dateEnd)) {
                        // Calculate temporal proximity
                        const imageDate = imageTournamentData.dateStart || imageTournamentData.dateEnd!
                        tournamentDate = imageDate
                        const timeDifference = Math.abs(targetDate.getTime() - imageDate.getTime())
                        daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
                        
                        // Closer dates get higher priority (max 500 points, decreasing with distance)
                        // Images within 30 days get max priority, then gradually decrease
                        if (daysDifference <= 30) {
                            priority = 500 - daysDifference
                            reason = `Close tournament (${daysDifference} days apart)`
                        } else if (daysDifference <= 90) {
                            priority = 400 - Math.floor(daysDifference / 2)
                            reason = `Nearby tournament (${daysDifference} days apart)`
                        } else if (daysDifference <= 365) {
                            priority = 300 - Math.floor(daysDifference / 10)
                            reason = `Same season (${daysDifference} days apart)`
                        } else {
                            priority = 200 - Math.floor(daysDifference / 30)
                            reason = `Different season (${daysDifference} days apart)`
                        }
                    } else {
                        // Tournament exists but no date info - lower priority
                        priority = 150
                        reason = 'Tournament without date info'
                    }
                } else {
                    // No tournament info - fallback priorities
                    if (image.isProfileImage) {
                        priority = 100
                        reason = 'Profile image fallback'
                    } else if (image.imageType === 'profile' || image.imageType === 'headshot') {
                        priority = 80
                        reason = 'Profile type fallback'
                    } else {
                        priority = 50
                        reason = 'Generic image fallback'
                    }
                }

                // Boost for more recent images based on createdAt
                if (image.createdAt) {
                    const imageAge = Math.floor((Date.now() - image.createdAt.getTime()) / (1000 * 60 * 60 * 24))
                    if (imageAge < 365) {
                        priority += Math.floor((365 - imageAge) / 10) // Up to 36 bonus points for recent images
                        reason += ` (recent: ${imageAge} days old)`
                    }
                }

                return {
                    ...image,
                    priority,
                    reason,
                    tournamentDate: tournamentDate?.toISOString() || null,
                    daysDifference
                }
            })

            // Sort by priority (highest first) and get the best match
            imagesWithPriority.sort((a, b) => b.priority - a.priority)
            const bestImage = imagesWithPriority[0]

            // Enhanced logging with image details
            const logDetails = {
                player: playerName,
                targetTournament: tournamentName,
                selectedImage: bestImage.fileName,
                fromTournament: bestImage.tournament || 'No tournament',
                reason: bestImage.reason,
                priority: bestImage.priority,
                daysDifference: bestImage.daysDifference,
                imageType: bestImage.imageType || 'Unknown',
                totalImagesConsidered: imagesWithPriority.length
            }
            

            
            // Log top 3 candidates for debugging
            if (imagesWithPriority.length > 1) {
                const topCandidates = imagesWithPriority.slice(0, 3).map((img, index) => ({
                    rank: index + 1,
                    fileName: img.fileName,
                    tournament: img.tournament || 'None',
                    priority: img.priority,
                    reason: img.reason,
                    daysDifference: img.daysDifference
                }))
            }
            
            return bestImage
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

    // Serve player image file directly with optimized caching
    fastify.get('/players/name/:playerName/image', {
        schema: {
            description: 'Serve player image file directly with fallback handling and caching',
            tags: ['players'],
            params: PlayerNameSeasonsParamSchema,
            querystring: {
                type: 'object',
                properties: {
                    tournament: {
                        type: 'string',
                        description: 'Tournament context for better image selection'
                    },
                    fallback: {
                        type: 'string',
                        enum: ['placeholder', 'none'],
                        description: 'Fallback behavior when no image is found'
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { playerName } = request.params as { playerName: string }
            const { tournament, fallback } = request.query as { tournament?: string, fallback?: string }
            customMetric.inc({ operation: 'serve_player_image' })

            // Create cache key for Redis
            const cacheKey = `player_image:${playerName}:${tournament || 'default'}`
            
            // Try Redis cache first
            let bestImage = null
            try {
                const cached = await redis.get(cacheKey)
                if (cached) {
                    fastify.log.info(`Cache HIT for key: ${cacheKey}`)
                    bestImage = JSON.parse(cached)
                    fastify.log.debug(`Redis cache hit for player image: ${playerName}`)
                }
            } catch (cacheError) {
                fastify.log.warn('Redis cache error:', cacheError)
            }

            // If not in cache, perform the lookup
            if (!bestImage) {
                fastify.log.info(`Cache MISS for key: ${cacheKey} - fetching from database`)
                // If tournament is provided, try optimized tournament-specific lookup
                if (tournament) {
                    try {
                        // Direct database query instead of internal API call for better performance
                        const tournamentData = await prisma.tournament.findFirst({
                            where: {
                                OR: [
                                    { overviewPage: tournament },
                                    { id: isNaN(parseInt(tournament)) ? -1 : parseInt(tournament) }
                                ]
                            },
                            select: { overviewPage: true, dateStart: true, dateEnd: true, name: true }
                        })

                        if (tournamentData) {
                            // Optimized player resolution with focused image query
                            const playerCheck = await prisma.playerRedirect.findFirst({
                                where: { 
                                    name: { equals: playerName }
                                },
                                select: { overviewPage: true }
                            })

                            if (playerCheck) {
                                // Get player images with tournament-specific optimization
                                const playerImages = await prisma.playerImage.findMany({
                                    where: {
                                        PlayerRedirect: {
                                            overviewPage: playerCheck.overviewPage
                                        }
                                    },
                                    orderBy: [
                                        { isProfileImage: 'desc' },
                                        { createdAt: 'desc' }
                                    ],
                                    take: 20 // Limit to most relevant images for performance
                                })

                                if (playerImages.length > 0) {
                                    // Fast tournament-specific scoring
                                    const scoredImages = playerImages.map(image => {
                                        let score = 0
                                        
                                        // Exact tournament match gets highest priority
                                        if (image.tournament === tournament) {
                                            score = 1000
                                        }
                                        // Profile images get high priority
                                        else if (image.isProfileImage) {
                                            score = 500
                                        }
                                        // Image type priority
                                        else if (image.imageType === 'profile' || image.imageType === 'headshot') {
                                            score = 300
                                        }
                                        // Recent images get some priority
                                        else {
                                            score = 100
                                            if (image.createdAt) {
                                                const ageInDays = (Date.now() - image.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                                                if (ageInDays < 365) {
                                                    score += Math.max(0, 50 - Math.floor(ageInDays / 10))
                                                }
                                            }
                                        }

                                        return { ...image, score }
                                    })

                                    // Get best image
                                    bestImage = scoredImages.sort((a, b) => b.score - a.score)[0]
                                }
                            }
                        }
                    } catch (error) {
                        fastify.log.warn(`Optimized tournament lookup failed for ${playerName} in ${tournament}:`, error)
                    }
                }

                // If no tournament-specific image found, try simple fallback
                if (!bestImage) {
                    try {
                        const playerCheck = await prisma.playerRedirect.findFirst({
                            where: { 
                                name: { equals: playerName }
                            },
                            select: { overviewPage: true }
                        })

                        if (playerCheck) {
                            const fallbackImage = await prisma.playerImage.findFirst({
                                where: {
                                    PlayerRedirect: {
                                        overviewPage: playerCheck.overviewPage
                                    }
                                },
                                orderBy: [
                                    { isProfileImage: 'desc' },
                                    { createdAt: 'desc' }
                                ]
                            })

                            if (fallbackImage) {
                                bestImage = fallbackImage
                            }
                        }
                    } catch (error) {
                        fastify.log.warn(`Fallback image lookup failed for ${playerName}:`, error)
                    }
                }

                // Cache the result in Redis
                try {
                    await redis.setex(cacheKey, REDIS_CACHE_TTL, JSON.stringify(bestImage))
                    fastify.log.info(`Cache SET for key: ${cacheKey} with TTL ${REDIS_CACHE_TTL}s`)
                    fastify.log.debug(`Cached player image result in Redis: ${playerName}`)
                } catch (cacheError) {
                    fastify.log.warn('Failed to cache player image result:', cacheError)
                }
            }

            // If we have an image, try to serve it
            if (bestImage && bestImage.fileName) {
                const path = require('path')
                const fs = require('fs').promises
                
                // Try different possible image paths
                const possiblePaths = [
                    path.join(process.cwd(), 'static', 'playerWebp', bestImage.fileName),
                    path.join(process.cwd(), 'public', 'static', 'playerWebp', bestImage.fileName),
                    path.join(process.cwd(), '..', 'public', 'static', 'playerWebp', bestImage.fileName)
                ]

                for (const imagePath of possiblePaths) {
                    try {
                        await fs.access(imagePath)
                        const imageBuffer = await fs.readFile(imagePath)
                        const ext = path.extname(bestImage.fileName).toLowerCase()
                        
                        let contentType = 'image/webp'
                        if (ext === '.png') contentType = 'image/png'
                        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
                        
                        return reply
                            .type(contentType)
                            .header('Cache-Control', 'public, max-age=86400') // Cache for 24 hours
                            .header('ETag', `"${bestImage.fileName}"`) // Add ETag for better caching
                            .send(imageBuffer)
                    } catch (error) {
                        // File not found at this path, try next one
                    }
                }
                
                fastify.log.warn(`Player image file not found: ${bestImage.fileName}`)
            }

            // No image found or file doesn't exist - handle fallback
            if (fallback === 'placeholder') {
                // Return a simple SVG placeholder
                const placeholder = `
                    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="#f0f0f0"/>
                        <text x="50" y="50" font-family="Arial" font-size="12" text-anchor="middle" fill="#666">
                            No Image
                        </text>
                    </svg>
                `
                return reply
                    .type('image/svg+xml')
                    .header('Cache-Control', 'public, max-age=3600')
                    .send(placeholder)
            } else if (fallback === 'none') {
                return reply.status(404).send({ error: 'Player image not found' })
            }

            // Default: return 404
            return reply.status(404).send({ error: 'Player image not found' })

        } catch (error) {
            if (error instanceof PlayerNotFoundError) {
                return reply.status(404).send({ error: 'Player not found' })
            }
            fastify.log.error('Error serving player image:', error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })

    // Batch endpoint for multiple player images - optimized for performance
    fastify.post('/players/images/batch', {
        schema: {
            description: 'Get multiple player images in a single optimized request',
            tags: ['players'],
            body: {
                type: 'object',
                properties: {
                    players: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                playerName: { type: 'string' },
                                tournament: { type: 'string', nullable: true }
                            },
                            required: ['playerName']
                        },
                        maxItems: 50 // Limit batch size
                    }
                },
                required: ['players']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        images: {
                            type: 'object',
                            additionalProperties: {
                                type: 'object',
                                properties: {
                                    fileName: { type: 'string', nullable: true },
                                    url: { type: 'string', nullable: true },
                                    cached: { type: 'boolean' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { players } = request.body as { 
                players: Array<{ playerName: string, tournament?: string }> 
            }
            
            customMetric.inc({ operation: 'batch_player_images' })
            
            const results: Record<string, { fileName: string | null, url: string | null, cached: boolean }> = {}
            
            // Try Redis in batch for all players
            try {
                const redisPipeline = redis.pipeline()
                const playerKeys = players.map(({ playerName, tournament }) => ({
                    playerName,
                    tournament,
                    key: `${playerName}:${tournament || 'default'}`,
                    cacheKey: `player_image:${playerName}:${tournament || 'default'}`
                }))
                
                // Build Redis pipeline
                playerKeys.forEach(({ cacheKey }) => redisPipeline.get(cacheKey))
                const redisResults = await redisPipeline.exec()
                
                // Process Redis results
                for (let i = 0; i < playerKeys.length; i++) {
                    const { playerName, tournament, key } = playerKeys[i]
                    const redisResult = redisResults?.[i]?.[1] as string | null
                    
                    if (redisResult) {
                        const image = JSON.parse(redisResult)
                        results[key] = {
                            fileName: image?.fileName || null,
                            url: image?.fileName ? `/api/players/name/${encodeURIComponent(playerName)}/image${tournament ? `?tournament=${encodeURIComponent(tournament)}` : ''}` : null,
                            cached: true
                        }
                    } else {
                        // Mark as needing database lookup
                        results[key] = {
                            fileName: null,
                            url: null,
                            cached: false
                        }
                    }
                }
                
            } catch (redisError) {
                fastify.log.warn('Redis batch error:', redisError)
                // Mark all as needing database lookup
                players.forEach(({ playerName, tournament }) => {
                    const key = `${playerName}:${tournament || 'default'}`
                    results[key] = {
                        fileName: null,
                        url: null,
                        cached: false
                    }
                })
            }
            
            // For players still not found, we return the results with cache miss indicators
            // The frontend can then make individual requests for the uncached ones if needed
            
            return { images: results }
            
        } catch (error) {
            fastify.log.error('Error in batch player images:', error)
            return reply.status(500).send({ error: 'Internal server error' })
        }
    })
}