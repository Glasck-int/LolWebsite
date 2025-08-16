import { FastifyInstance } from 'fastify'
import { ErrorResponseSchema } from '../../schemas/common'
import prisma from '../../services/prisma'
import { SeasonResponse, SplitResponse, TournamentResponse } from '@glasck-int/glasck-types'
import { resolvePlayer, PlayerNotFoundError } from '../../utils/playerUtils'
import { resolveTeam, TeamNotFoundError } from '../../utils/teamUtils'
import { PlayerNameSeasonsParamSchema, TeamNameSeasonsParamSchema } from '../../schemas/params'

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
                    fastify.log.info(`Cache HIT for key: ${cacheKey}`)
                    return JSON.parse(cached)
                }

                fastify.log.info(`Cache MISS for key: ${cacheKey} - fetching from database`)

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

                // Helper function to extract year from tournament name or date
                const guessYear = (tournament: typeof tournaments[0]): string => {
                    // First try to extract year from tournament name
                    const yearMatch = tournament.name.match(/\b(19|20)\d{2}\b/)
                    if (yearMatch) {
                        return yearMatch[0]
                    }
                    
                    // If no year in name, try to use dateStart
                    if (tournament.dateStart) {
                        return tournament.dateStart.getFullYear().toString()
                    }
                    
                    // If no date, try to extract from overviewPage URL if exists
                    if (tournament.overviewPage) {
                        const urlYearMatch = tournament.overviewPage.match(/\b(19|20)\d{2}\b/)
                        if (urlYearMatch) {
                            return urlYearMatch[0]
                        }
                    }
                    
                    return 'Unknown'
                }


                // Group tournaments by year (season) and split
                const seasonsMap = new Map<string, Map<string | undefined, { tournaments: TournamentResponse[], splitNumber?: number, dateStart?: Date }>>()

                tournaments.forEach(tournament => {
                    // Skip tournaments with no matches
                    if (tournament._count.MatchSchedule === 0) {
                        return
                    }

                    // Use the year field as season, or guess it if missing
                    const season = tournament.year || guessYear(tournament)
                    
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
                        season !== 'Unknown' ? season : undefined
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
                fastify.log.info(`Cache SET for key: ${cacheKey} with TTL 86400s`)
                return result

            } catch (error) {
                console.error('Error in seasons route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )

    // Route for getting seasons by player name
    fastify.get<{ Params: { playerName: string } }>(
        '/seasons/player/:playerName',
        {
            schema: {
                description: 'Get seasons, splits, and tournaments data for TableEntityLayout by player name',
                tags: ['seasons'],
                params: PlayerNameSeasonsParamSchema,
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
                const { playerName } = request.params
                const cacheKey = `seasons:player:${playerName}`
                console.log(`Fetching player seasons for: ${playerName}`)

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    fastify.log.info(`Cache HIT for key: ${cacheKey}`)
                    return JSON.parse(cached)
                }

                fastify.log.info(`Cache MISS for key: ${cacheKey} - fetching from database`)

                // Resolve player to get all redirects/aliases
                let playerResolution
                try {
                    playerResolution = await resolvePlayer(playerName)
                } catch (error) {
                    if (error instanceof PlayerNotFoundError) {
                        return reply
                            .status(404)
                            .send({ error: `Player not found: ${playerName}` })
                    }
                    throw error
                }

                const redirectNames = playerResolution.redirectNames

                // Find all tournaments where the player has participated
                // Query both ScoreboardPlayers and TournamentPlayer tables
                const [scoreboardTournaments, tournamentPlayerEntries] = await Promise.all([
                    // Get unique tournament overviewPages from ScoreboardPlayers
                    prisma.scoreboardPlayers.findMany({
                        where: {
                            OR: redirectNames.flatMap(name => [
                                // { name: name },
                                { link: name }
                            ])
                        },
                        select: {
                            overviewPage: true
                        },
                        distinct: ['overviewPage']
                    }),
                    // Get unique tournament overviewPages from TournamentPlayer
                    prisma.tournamentPlayer.findMany({
                        where: {
                            OR: redirectNames.flatMap(name => [
                                { player: name },
                                { link: name }
                            ])
                        },
                        select: {
                            overviewPage: true
                        },
                        distinct: ['overviewPage']
                    })
                ])

                // Combine and get unique tournament overviewPages
                const tournamentOverviewPages = new Set<string>()
                scoreboardTournaments.forEach(t => {
                    if (t.overviewPage) tournamentOverviewPages.add(t.overviewPage)
                })
                tournamentPlayerEntries.forEach(t => {
                    if (t.overviewPage) tournamentOverviewPages.add(t.overviewPage)
                })

                if (tournamentOverviewPages.size === 0) {
                    return reply
                        .status(404)
                        .send({ error: `No tournaments found for player: ${playerName}` })
                }

                // Fetch full tournament details with match count and league info
                const tournaments = await prisma.tournament.findMany({
                    where: {
                        overviewPage: { in: Array.from(tournamentOverviewPages) }
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
                        league: true,
                        League: {
                            select: {
                                name: true,
                                short: true
                            }
                        },
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
                        .send({ error: `No tournament data found for player: ${playerName}` })
                }

                // Helper function to extract year from tournament name or date
                const guessYear = (tournament: typeof tournaments[0]): string => {
                    // First try to extract year from tournament name
                    const yearMatch = tournament.name.match(/\b(19|20)\d{2}\b/)
                    if (yearMatch) {
                        return yearMatch[0]
                    }
                    
                    // If no year in name, try to use dateStart
                    if (tournament.dateStart) {
                        return tournament.dateStart.getFullYear().toString()
                    }
                    
                    // If no date, try to extract from overviewPage URL if exists
                    if (tournament.overviewPage) {
                        const urlYearMatch = tournament.overviewPage.match(/\b(19|20)\d{2}\b/)
                        if (urlYearMatch) {
                            return urlYearMatch[0]
                        }
                    }
                    
                    return 'Unknown'
                }

                // Group tournaments by year (season) and split
                const seasonsMap = new Map<string, Map<string | undefined, { tournaments: TournamentResponse[], splitNumber?: number, dateStart?: Date }>>()

                tournaments.forEach(tournament => {
                    // Skip tournaments with no matches
                    if (tournament._count.MatchSchedule === 0) {
                        return
                    }

                    const year = tournament.year || guessYear(tournament)
                    let split = tournament.split || undefined
                    
                    // Clean up split name if it exists
                    if (split) {
                        split = cleanupStringFormatting(split)
                    }
                    
                    if (!seasonsMap.has(year)) {
                        seasonsMap.set(year, new Map())
                    }

                    const yearMap = seasonsMap.get(year)!
                    if (!yearMap.has(split)) {
                        yearMap.set(split, { 
                            tournaments: [], 
                            splitNumber: tournament.splitNumber ?? undefined,
                            dateStart: tournament.dateStart ?? undefined 
                        })
                    }

                    const splitData = yearMap.get(split)!
                    
                    // Clean tournament name using league info from the tournament
                    const cleanedTournamentName = cleanTournamentName(
                        tournament.name,
                        tournament.League?.name || tournament.league || '',
                        tournament.League?.short || '',
                        year !== 'Unknown' ? year : undefined
                    )
                    
                    const tournamentResponse: TournamentResponse = {
                        tournament: cleanedTournamentName,
                        id: tournament.id
                    }
                    
                    splitData.tournaments.push(tournamentResponse)
                })

                // Convert to result format
                const result: SeasonResponse[] = Array.from(seasonsMap.entries())
                    .map(([season, splits]) => ({
                        season,
                        data: Array.from(splits.entries())
                            .map(([split, data]) => {
                                const splitResponse: SplitResponse = {
                                    split: split || undefined,
                                    tournaments: data.tournaments.sort((a, b) => {
                                        const aTournament = tournaments.find(t => t.id === a.id)
                                        const bTournament = tournaments.find(t => t.id === b.id)
                                        
                                        if (aTournament?.dateStart && bTournament?.dateStart) {
                                            return aTournament.dateStart.getTime() - bTournament.dateStart.getTime()
                                        }
                                        
                                        return a.tournament.localeCompare(b.tournament)
                                    })
                                }
                                return splitResponse
                            })
                            .sort((a, b) => {
                                const aSplitData = splits.get(a.split)
                                const bSplitData = splits.get(b.split)
                                
                                // If both have splitNumber, sort by that
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

                // Cache for 1 hour (3600 seconds) - player data might change more frequently than league data
                await redis.setex(cacheKey, 3600, JSON.stringify(result))
                fastify.log.info(`Cache SET for key: ${cacheKey} with TTL 3600s`)
                return result

            } catch (error) {
                console.error('Error in player seasons route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )

    // Route for getting seasons by team name
    fastify.get<{ Params: { teamName: string } }>(
        '/seasons/team/:teamName',
        {
            schema: {
                description: 'Get seasons, splits, and tournaments data for TableEntityLayout by team name',
                tags: ['seasons'],
                params: TeamNameSeasonsParamSchema,
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
                const { teamName } = request.params
                const cacheKey = `seasons:team:${teamName}`

                // Check cache first
                const cached = await redis.get(cacheKey)
                if (cached) {
                    fastify.log.info(`Cache HIT for key: ${cacheKey}`)
                    return JSON.parse(cached)
                }

                fastify.log.info(`Cache MISS for key: ${cacheKey} - fetching from database`)

                // Resolve team to get all redirects/aliases
                let teamResolution
                try {
                    teamResolution = await resolveTeam(teamName)
                } catch (error) {
                    if (error instanceof TeamNotFoundError) {
                        return reply
                            .status(404)
                            .send({ error: `Team not found: ${teamName}` })
                    }
                    throw error
                }

                const redirectNames = teamResolution.redirectNames

                // Find all tournaments where the team has participated
                // Query both ScoreboardTeam and TournamentRosters tables
                const [scoreboardTournaments, tournamentRosterEntries] = await Promise.all([
                    // Get unique tournament overviewPages from ScoreboardTeam
                    prisma.scoreboardTeam.findMany({
                        where: {
                            OR: redirectNames.map(name => ({
                                team: { equals: name }
                            }))
                        },
                        select: {
                            overviewPage: true
                        },
                        distinct: ['overviewPage']
                    }),
                    // Get unique tournament overviewPages from TournamentRosters
                    prisma.tournamentRosters.findMany({
                        where: {
                            OR: redirectNames.flatMap(name => [
                                { teamName: { equals: name} },
                                { rosterLinks: { hasSome: [name] } } // hasSome is already case-sensitive but we keep one entry per name
                            ])
                        },
                        select: {
                            overviewPage: true
                        },
                        distinct: ['overviewPage']
                    })
                ])

                // Combine and get unique tournament overviewPages
                const tournamentOverviewPages = new Set<string>()
                scoreboardTournaments.forEach(t => {
                    if (t.overviewPage) tournamentOverviewPages.add(t.overviewPage)
                })
                tournamentRosterEntries.forEach(t => {
                    if (t.overviewPage) tournamentOverviewPages.add(t.overviewPage)
                })

                if (tournamentOverviewPages.size === 0) {
                    return reply
                        .status(404)
                        .send({ error: `No tournaments found for team: ${teamName}` })
                }

                // Fetch full tournament details with match count and league info
                const tournaments = await prisma.tournament.findMany({
                    where: {
                        overviewPage: { in: Array.from(tournamentOverviewPages) }
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
                        league: true,
                        League: {
                            select: {
                                name: true,
                                short: true
                            }
                        },
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
                        .send({ error: `No tournament data found for team: ${teamName}` })
                }

                // Helper function to extract year from tournament name or date
                const guessYear = (tournament: typeof tournaments[0]): string => {
                    // First try to extract year from tournament name
                    const yearMatch = tournament.name.match(/\b(19|20)\d{2}\b/)
                    if (yearMatch) {
                        return yearMatch[0]
                    }
                    
                    // If no year in name, try to use dateStart
                    if (tournament.dateStart) {
                        return tournament.dateStart.getFullYear().toString()
                    }
                    
                    // If no date, try to extract from overviewPage URL if exists
                    if (tournament.overviewPage) {
                        const urlYearMatch = tournament.overviewPage.match(/\b(19|20)\d{2}\b/)
                        if (urlYearMatch) {
                            return urlYearMatch[0]
                        }
                    }
                    
                    return 'Unknown'
                }

                // Group tournaments by year (season) and split
                const seasonsMap = new Map<string, Map<string | undefined, { tournaments: TournamentResponse[], splitNumber?: number, dateStart?: Date }>>()

                tournaments.forEach(tournament => {
                    // Skip tournaments with no matches
                    if (tournament._count.MatchSchedule === 0) {
                        return
                    }

                    const year = tournament.year || guessYear(tournament)
                    let split = tournament.split || undefined
                    
                    // Clean up split name if it exists
                    if (split) {
                        split = cleanupStringFormatting(split)
                    }
                    
                    if (!seasonsMap.has(year)) {
                        seasonsMap.set(year, new Map())
                    }

                    const yearMap = seasonsMap.get(year)!
                    if (!yearMap.has(split)) {
                        yearMap.set(split, { 
                            tournaments: [], 
                            splitNumber: tournament.splitNumber ?? undefined,
                            dateStart: tournament.dateStart ?? undefined 
                        })
                    }

                    const splitData = yearMap.get(split)!
                    
                    // Clean tournament name using league info from the tournament
                    const cleanedTournamentName = cleanTournamentName(
                        tournament.name,
                        tournament.League?.name || tournament.league || '',
                        tournament.League?.short || '',
                        year !== 'Unknown' ? year : undefined
                    )
                    
                    const tournamentResponse: TournamentResponse = {
                        tournament: cleanedTournamentName,
                        id: tournament.id
                    }
                    
                    splitData.tournaments.push(tournamentResponse)
                })

                // Convert to result format
                const result: SeasonResponse[] = Array.from(seasonsMap.entries())
                    .map(([season, splits]) => ({
                        season,
                        data: Array.from(splits.entries())
                            .map(([split, data]) => {
                                const splitResponse: SplitResponse = {
                                    split: split || undefined,
                                    tournaments: data.tournaments.sort((a, b) => {
                                        const aTournament = tournaments.find(t => t.id === a.id)
                                        const bTournament = tournaments.find(t => t.id === b.id)
                                        
                                        if (aTournament?.dateStart && bTournament?.dateStart) {
                                            return aTournament.dateStart.getTime() - bTournament.dateStart.getTime()
                                        }
                                        
                                        return a.tournament.localeCompare(b.tournament)
                                    })
                                }
                                return splitResponse
                            })
                            .sort((a, b) => {
                                const aSplitData = splits.get(a.split)
                                const bSplitData = splits.get(b.split)
                                
                                // If both have splitNumber, sort by that
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

                // Cache for 1 hour (3600 seconds) - team data might change more frequently than league data
                await redis.setex(cacheKey, 3600, JSON.stringify(result))
                return result

            } catch (error) {
                console.error('Error in team seasons route:', error)
                return reply
                    .status(500)
                    .send({ error: 'Internal server error' })
            }
        }
    )
}