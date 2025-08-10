import { FastifyInstance } from 'fastify'
import { ErrorResponseSchema } from '../../schemas/common'
import prisma from '../../services/prisma'
import { SeasonResponse, SplitResponse, TournamentResponse } from '@glasck-int/glasck-types'

/**
 * Clean up extra spaces and separators in a string
 */
function cleanupStringFormatting(str: string): string {
    const cleaned = str
        .replace(/\s+/g, ' ')  // Multiple spaces to single space
        .replace(/^[-\s]+|[-\s]+$/g, '')  // Remove leading/trailing dashes and spaces
        .replace(/\s*[-–—]\s*/g, ' - ')  // Normalize separators
        .trim()
    
    // Capitalize first letter if it exists
    return cleaned.length > 0 ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : cleaned
}

/**
 * Clean tournament name by removing league name, short name, and year if there's additional content
 * Only clean if the name contains more than just the league/short/year
 */
function cleanTournamentName(tournamentName: string, leagueName: string, leagueShort: string, year?: string): string {
    const originalName = tournamentName
    let cleanedName = tournamentName

    // Create regex patterns for league name, short, and year
    const patterns = []
    
    // Add league name pattern (case insensitive)
    if (leagueName) {
        patterns.push(new RegExp(`\\b${leagueName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'))
    }
    
    // Add league short pattern (case insensitive)
    if (leagueShort && leagueShort !== leagueName) {
        patterns.push(new RegExp(`\\b${leagueShort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'))
    }
    
    // Add year pattern
    if (year) {
        patterns.push(new RegExp(`\\b${year}\\b`, 'g'))
    }

    // Apply each pattern
    for (const pattern of patterns) {
        cleanedName = cleanedName.replace(pattern, '').trim()
    }

    // Clean up extra spaces and separators
    cleanedName = cleanupStringFormatting(cleanedName)

    // Only return cleaned name if there's still meaningful content
    // Avoid returning empty string or just separators
    if (cleanedName && cleanedName.length > 2 && !/^[-\s]*$/.test(cleanedName)) {
        return cleanedName
    }

    // If cleaning would result in empty or meaningless string, return original
    return originalName
}

export default async function seasonsRoutes(fastify: FastifyInstance) {
    const redis = fastify.redis

    fastify.get<{ Params: { leagueId: string } }>(
        '/seasons/league/:leagueId',
        {
            schema: {
                description: 'Get seasons, splits, and tournaments data for TableEntityLayout by league ID',
                tags: ['seasons'],
                params: {
                    type: 'object',
                    properties: {
                        leagueId: { type: 'string' }
                    },
                    required: ['leagueId']
                },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                season: { type: 'string' },
                                data: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            split: { type: 'string' },
                                            tournaments: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        tournament: { type: 'string' },
                                                        id: { type: 'number' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: ErrorResponseSchema,
                    500: ErrorResponseSchema,
                },
            },
        },
        async (request, reply) => {
            try {
                const { leagueId } = request.params
                const cacheKey = `seasons:league:${leagueId}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    return JSON.parse(cached)
                }

                // Get league first, then tournaments by league name
                const league = await prisma.league.findUnique({
                    where: {
                        id: parseInt(leagueId)
                    },
                    select: {
                        name: true,
                        short: true
                    }
                })

                if (!league) {
                    return reply
                        .status(404)
                        .send({ error: 'League not found' })
                }

                // Get tournaments by league name with match count
                const tournaments = await prisma.tournament.findMany({
                    where: {
                        league: league.name
                    },
                    select: {
                        id: true,
                        name: true,
                        year: true,
                        split: true,
                        splitNumber: true,
                        splitMainPage: true,
                        dateStart: true,
                        overviewPage: true,
                        _count: {
                            select: {
                                MatchSchedule: true
                            }
                        }
                    },
                    orderBy: [
                        { year: 'asc' },
                        { splitNumber: 'asc' },
                        { dateStart: 'asc' },
                        { name: 'asc' }
                    ]
                })

                if (tournaments.length === 0) {
                    return reply
                        .status(404)
                        .send({ error: 'No tournaments found for this league' })
                }

                // Group tournaments by year (season) and split
                const seasonsMap = new Map<string, Map<string | undefined, { tournaments: TournamentResponse[], splitNumber?: number, dateStart?: Date }>>()

                tournaments.forEach(tournament => {
                    // Skip tournaments with no matches
                    if (tournament._count.MatchSchedule === 0) {
                        return
                    }

                    // Use the year field as season, fallback to 'Unknown'
                    const season = tournament.year || 'Unknown'
                    
                    // Use split field or detect from splitMainPage/name
                    let split: string | undefined = undefined
                    
                    if (tournament.split) {
                        split = tournament.split.toLowerCase()
                    } else if (tournament.splitMainPage) {
                        split = tournament.splitMainPage.toLowerCase()
                    } else {
                        // Fallback to name-based detection
                        const lowerName = tournament.name.toLowerCase()
                        
                        if (lowerName.includes('spring') || lowerName.includes('split 1')) {
                            split = 'spring'
                        } else if (lowerName.includes('summer') || lowerName.includes('split 2')) {
                            split = 'summer'
                        } else if (lowerName.includes('winter')) {
                            split = 'winter'
                        } else if (lowerName.includes('playoff')) {
                            split = 'playoffs'
                        } else if (lowerName.includes('championship') || lowerName.includes('finals')) {
                            split = 'championship'
                        }
                        // If no split detected, split stays undefined
                    }

                    // Clean up split name if it exists
                    if (split) {
                        split = cleanupStringFormatting(split)
                    }

                    // Initialize season if not exists
                    if (!seasonsMap.has(season)) {
                        seasonsMap.set(season, new Map())
                    }

                    const seasonSplits = seasonsMap.get(season)!
                    
                    // Initialize split if not exists
                    if (!seasonSplits.has(split)) {
                        seasonSplits.set(split, {
                            tournaments: [],
                            splitNumber: tournament.splitNumber || undefined,
                            dateStart: tournament.dateStart || undefined
                        })
                    }

                    // Clean tournament name before adding
                    const cleanedTournamentName = cleanTournamentName(
                        tournament.name, 
                        league.name, 
                        league.short, 
                        tournament.year || undefined
                    )

                    // Add tournament to split
                    seasonSplits.get(split)!.tournaments.push({
                        tournament: cleanedTournamentName,
                        id: tournament.id
                    })
                })

                // Convert to required format for TableEntityLayout
                const result: SeasonResponse[] = Array.from(seasonsMap.entries())
                    .map(([season, splitsMap]) => ({
                        season,
                        data: Array.from(splitsMap.entries())
                            .map(([split, splitData]) => {
                                const result: SplitResponse = {
                                    tournaments: splitData.tournaments
                                }
                                if (split) {
                                    result.split = split
                                }
                                return result
                            })
                            .sort((a, b) => {
                                // Get original split data for sorting
                                const aSplitData = splitsMap.get(a.split)
                                const bSplitData = splitsMap.get(b.split)
                                
                                // Sort splits: undefined first
                                if (!a.split && b.split) return -1
                                if (a.split && !b.split) return 1
                                if (!a.split && !b.split) return 0
                                
                                // If both have splitNumber, sort by splitNumber
                                if (aSplitData?.splitNumber !== undefined && bSplitData?.splitNumber !== undefined) {
                                    return aSplitData.splitNumber - bSplitData.splitNumber
                                }
                                
                                // If one has splitNumber and other doesn't, splitNumber comes first
                                if (aSplitData?.splitNumber !== undefined && bSplitData?.splitNumber === undefined) {
                                    return -1
                                }
                                if (aSplitData?.splitNumber === undefined && bSplitData?.splitNumber !== undefined) {
                                    return 1
                                }
                                
                                // If neither has splitNumber, sort by dateStart
                                if (aSplitData?.dateStart && bSplitData?.dateStart) {
                                    return aSplitData.dateStart.getTime() - bSplitData.dateStart.getTime()
                                }
                                
                                // Fallback to alphabetical order
                                return a.split!.localeCompare(b.split!)
                            })
                    }))
                    .sort((a, b) => {
                        // Sort seasons numerically if they're years
                        const aNum = parseInt(a.season)
                        const bNum = parseInt(b.season)
                        if (!isNaN(aNum) && !isNaN(bNum)) {
                            return aNum - bNum
                        }
                        return a.season.localeCompare(b.season)
                    })

                // Cache for 1 day (86400 seconds) - seasons don't change often
                await redis.setex(cacheKey, 86400, JSON.stringify(result))
                return result

            } catch (error) {
                console.error('Error in seasons route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )
}