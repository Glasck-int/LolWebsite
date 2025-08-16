import prisma from '../services/prisma'
import type { Player, PlayerRedirect, PlayerImage, Prisma } from '../generated/prisma'

/**
 * Type for PlayerRedirect with PlayerImage include
 */
type PlayerRedirectWithImages = Prisma.PlayerRedirectGetPayload<{
    include: { PlayerImage: true }
}>

/**
 * Type for Player with PlayerRedirect include
 */
type PlayerWithRedirects = Prisma.PlayerGetPayload<{
    include: { PlayerRedirect: true }
}>

/**
 * Type for Player with PlayerRedirect that includes PlayerImage
 */
type PlayerWithRedirectsAndImages = Prisma.PlayerGetPayload<{
    include: { 
        PlayerRedirect: {
            include: { PlayerImage: true }
        }
    }
}>

/**
 * Player resolution result containing the resolved player information
 */
export interface PlayerResolution {
    /** The canonical overview page identifier for the player */
    overviewPage: string
    /** All redirect names that point to this player */
    redirectNames: string[]
    /** The full Player object (if requested) */
    player?: Player | PlayerWithRedirects | PlayerWithRedirectsAndImages
    /** All PlayerRedirect objects for this player (if requested) */
    redirects?: PlayerRedirect[] | PlayerRedirectWithImages[]
    /** All images associated with this player (if requested) */
    images?: PlayerImage[]
}

/**
 * Options for player resolution
 */
export interface PlayerResolutionOptions {
    /** Whether to include the full Player object */
    includePlayer?: boolean
    /** Whether to include all PlayerRedirect objects */
    includeRedirects?: boolean
    /** Whether to include all images associated with the player */
    includeImages?: boolean
}

/**
 * Custom error for player not found scenarios
 */
export class PlayerNotFoundError extends Error {
    constructor(playerName: string) {
        super(`Player not found: ${playerName}`)
        this.name = 'PlayerNotFoundError'
    }
}

/**
 * Resolves a player name to the canonical player information, handling redirects
 * 
 * This utility consolidates player redirect logic that was previously duplicated
 * across multiple endpoints (players routes, champion stats service, etc.)
 * 
 * @param playerName - The player name or alias to resolve
 * @param options - Options for what data to include in the result
 * @returns Promise<PlayerResolution> - The resolved player information
 * @throws PlayerNotFoundError - If the player cannot be found
 * 
 * @example
 * // Basic usage - just get the canonical overview page and redirect names
 * const resolution = await resolvePlayer('G2 Caps')
 * console.log(resolution.overviewPage) // 'Caps'
 * console.log(resolution.redirectNames) // ['Caps', 'G2 Caps', 'Rasmus Winther']
 * 
 * @example
 * // Get full player data with redirects and images
 * const resolution = await resolvePlayer('Faker', {
 *   includePlayer: true,
 *   includeRedirects: true,
 *   includeImages: true
 * })
 * console.log(resolution.player.name) // 'Faker'
 * console.log(resolution.redirects.length) // Number of redirect entries
 * console.log(resolution.images.length) // Number of images
 */
export async function resolvePlayer(
    playerName: string,
    options: PlayerResolutionOptions = {}
): Promise<PlayerResolution> {
    const { includePlayer = false, includeRedirects = false, includeImages = false } = options

    // First, try to find the player redirect entry for the given name (case sensitive)
    let playerRedirect = await prisma.playerRedirect.findUnique({
        where: { name: playerName }
    })

    let overviewPage: string

    if (!playerRedirect) {
        // Try to find in Player table directly by overviewPage (case sensitive)
        const playerDirect = await prisma.player.findFirst({
            where: { 
                overviewPage: playerName
            }
        })
        
        if (!playerDirect) {
            // Try with first letter capitalized
            const capitalizedName = playerName.charAt(0).toUpperCase() + playerName.slice(1)
            const playerDirectCapitalized = await prisma.player.findFirst({
                where: { 
                    overviewPage: capitalizedName
                }
            })
            
            if (!playerDirectCapitalized) {
                throw new PlayerNotFoundError(playerName)
            }
            
            overviewPage = playerDirectCapitalized.overviewPage
            
            // Create a virtual redirect for consistency with the rest of the function
            playerRedirect = {
                id: -1, // Virtual ID
                name: playerName,
                overviewPage: playerDirectCapitalized.overviewPage
            }
        } else {
            overviewPage = playerDirect.overviewPage
            
            // Create a virtual redirect for consistency with the rest of the function
            playerRedirect = {
                id: -1, // Virtual ID
                name: playerName,
                overviewPage: playerDirect.overviewPage
            }
        }
    } else {
        overviewPage = playerRedirect.overviewPage
    }

    // Initialize the result with the basic information
    const result: PlayerResolution = {
        overviewPage,
        redirectNames: [] // Will be populated below
    }

    // Handle redirects - fetch with or without images based on options
    if (includeRedirects) {
        if (includeImages) {
            const redirectsWithImages = await prisma.playerRedirect.findMany({
                where: { overviewPage },
                include: { PlayerImage: true }
            })
            result.redirects = redirectsWithImages
            result.redirectNames = redirectsWithImages.map(redirect => redirect.name)
        } else {
            const redirects = await prisma.playerRedirect.findMany({
                where: { overviewPage }
            })
            result.redirects = redirects
            result.redirectNames = redirects.map(redirect => redirect.name)
        }
    } else {
        // Just get redirect names for the basic case
        const redirectNames = await prisma.playerRedirect.findMany({
            where: { overviewPage },
            select: { name: true }
        })
        result.redirectNames = redirectNames.map(redirect => redirect.name)
    }

    // Handle player data
    if (includePlayer) {
        if (includeRedirects && includeImages) {
            // Include player with redirects and images
            const player = await prisma.player.findUnique({
                where: { overviewPage },
                include: {
                    PlayerRedirect: {
                        include: { PlayerImage: true }
                    }
                }
            })
            if (!player) {
                throw new PlayerNotFoundError(playerName)
            }
            result.player = player
        } else if (includeRedirects) {
            // Include player with redirects only
            const player = await prisma.player.findUnique({
                where: { overviewPage },
                include: { PlayerRedirect: true }
            })
            if (!player) {
                throw new PlayerNotFoundError(playerName)
            }
            result.player = player
        } else {
            // Include basic player only
            const player = await prisma.player.findUnique({
                where: { overviewPage }
            })
            if (!player) {
                throw new PlayerNotFoundError(playerName)
            }
            result.player = player
        }
    }

    // Handle images
    if (includeImages) {
        if (result.redirects && result.redirects.length > 0 && 'PlayerImage' in result.redirects[0]) {
            // Extract images from redirects we already fetched
            const redirectsWithImages = result.redirects as PlayerRedirectWithImages[]
            result.images = redirectsWithImages.flatMap(redirect => redirect.PlayerImage || [])
        } else if (result.player && 'PlayerRedirect' in result.player) {
            // Extract images from player redirects we already fetched
            const playerWithRedirects = result.player as PlayerWithRedirectsAndImages
            result.images = playerWithRedirects.PlayerRedirect.flatMap(redirect => 
                'PlayerImage' in redirect ? redirect.PlayerImage || [] : []
            )
        } else {
            // Fetch images separately
            const redirectsWithImages = await prisma.playerRedirect.findMany({
                where: { overviewPage },
                include: { PlayerImage: true }
            })
            result.images = redirectsWithImages.flatMap(redirect => redirect.PlayerImage || [])
        }
    }

    return result
}

/**
 * Quick utility to get just the redirect names for a player
 * Useful for database queries that need to match against any player alias
 * 
 * @param playerName - The player name or alias
 * @returns Promise<string[]> - Array of all redirect names for the player
 * @throws PlayerNotFoundError - If the player cannot be found
 * 
 * @example
 * const names = await getPlayerRedirectNames('G2 Caps')
 * // Use in database query: { link: { in: names } }
 */
export async function getPlayerRedirectNames(playerName: string): Promise<string[]> {
    const resolution = await resolvePlayer(playerName)
    return resolution.redirectNames
}

/**
 * Quick utility to get the canonical overview page for a player
 * Useful when you need the main identifier for a player
 * 
 * @param playerName - The player name or alias
 * @returns Promise<string> - The canonical overview page identifier
 * @throws PlayerNotFoundError - If the player cannot be found
 * 
 * @example
 * const overviewPage = await getPlayerOverviewPage('G2 Caps')
 * console.log(overviewPage) // 'Caps'
 */
export async function getPlayerOverviewPage(playerName: string): Promise<string> {
    const resolution = await resolvePlayer(playerName)
    return resolution.overviewPage
}

/**
 * Checks if a player exists in the database
 * 
 * @param playerName - The player name or alias to check
 * @returns Promise<boolean> - True if player exists, false otherwise
 * 
 * @example
 * const exists = await playerExists('Faker')
 * if (exists) {
 *   // Player exists, safe to proceed
 * }
 */
export async function playerExists(playerName: string): Promise<boolean> {
    try {
        await resolvePlayer(playerName)
        return true
    } catch (error: unknown) {
        if (error instanceof PlayerNotFoundError) {
            return false
        }
        throw error // Re-throw other errors
    }
}

/**
 * Batch resolve multiple players at once
 * Useful when you need to resolve multiple player names efficiently
 * 
 * @param playerNames - Array of player names to resolve
 * @param options - Options for what data to include in the results
 * @returns Promise<PlayerResolution[]> - Array of resolved player information
 * 
 * Note: Players that cannot be found will be filtered out. 
 * Use the returned array length to check if all players were found.
 * 
 * @example
 * const resolutions = await batchResolvePlayer(['Caps', 'Faker', 'Jankos'])
 * console.log(resolutions.length) // Number of successfully resolved players
 */
export async function batchResolvePlayer(
    playerNames: string[],
    options: PlayerResolutionOptions = {}
): Promise<PlayerResolution[]> {
    const resolutions = await Promise.allSettled(
        playerNames.map(name => resolvePlayer(name, options))
    )

    return resolutions
        .filter((result): result is PromiseFulfilledResult<PlayerResolution> => result.status === 'fulfilled')
        .map(result => result.value)
}