import { apiRequest, ApiResponse } from './utils'
import { PlayerImageType, PlayerWithRedirects, PlayerSearchResult } from '@glasck-int/glasck-types'
import { getPublicPlayerImage } from './image'

/**
 * Get a player by exact name match
 * @param name - The exact name of the player to get
 * @returns The player with the exact name match
 */
async function getPlayerByExactName(
    name: string
): Promise<ApiResponse<PlayerWithRedirects>> {
    const encodedName = encodeURIComponent(name)
    return apiRequest<PlayerWithRedirects>(
        `/api/players/name/${encodedName}`
    )
}

/**
 * Get a player by their link
 * @warning This is A Fuzzy Search, so it will return all players that contain the link in their name
 * @param link - The link of the player to get
 * @returns The player with the given link
 */
async function getPlayerByLink(
    link: string
): Promise<ApiResponse<PlayerSearchResult[]>> {
    const encodedLink = encodeURIComponent(link)
    return apiRequest<PlayerSearchResult[]>(
        `/api/players/search/${encodedLink}`
    )
}

async function getPlayerImage(
    name: string,
    tournament?: string
): Promise<ApiResponse<string>> {
    const images = await apiRequest<PlayerImageType[]>(`/api/players/name/${name}/images`)
    
    if (!images.data || images.data.length === 0) {
        return { error: 'No images found', data: '' }
    }

    // Check if any image has the specified tournament (only if tournament is provided)
    const tournamentMatch = tournament ? images.data.find(img => img.tournament === tournament) : null
    
    // If no tournament match or no tournament specified, find image with most recent year in filename
    const selectedImage = tournamentMatch || (() => {
        const imagesWithYears = images.data
            .map(img => {
                const yearMatch = img.fileName.match(/(\d{4})/)
                return {
                    image: img,
                    year: yearMatch ? parseInt(yearMatch[1]) : 0
                }
            })
            .sort((a, b) => b.year - a.year) // Sort by year descending
        
        return imagesWithYears[0]?.image || images.data[0]
    })()
    
    // Return the image filename with .webp extension
    const imageUrl = selectedImage.fileName.replace('.png', '.webp')
    
    // Verify if the image exists using getPublicPlayerImage
    const imageCheck = await getPublicPlayerImage(imageUrl)
    if (imageCheck.data) {
        // console.log('imageUrl', imageUrl, 'player', name)
        return { data: imageCheck.data }
    }
    
    // If the primary image doesn't exist, try other images
    for (const img of images.data) {
        if (img === selectedImage) continue // Skip already tried image
        
        const fallbackImageUrl = img.fileName.replace('.png', '.webp')
        const fallbackCheck = await getPublicPlayerImage(fallbackImageUrl)
        if (fallbackCheck.data) {
            // console.log('Using fallback image:', fallbackImageUrl, 'for player', name)
            return { data: fallbackCheck.data }
        }
    }
    
    return { error: 'No images found', data: '' }
}

async function getPlayerImages(
    name: string,
    tournament: string
): Promise<ApiResponse<string>> {
    return getPlayerImage(name, tournament)
}

/**
 * Get player details including role information
 * @param name - The player name to get details for
 * @returns The player details with role information
 */
async function getPlayerDetails(
    name: string
): Promise<ApiResponse<{ role?: string; team?: string }>> {
    try {
        const response = await apiRequest<Array<{ role?: string; team?: string }>>(`/api/players/search/${encodeURIComponent(name)}`)
        
        if (!response.data || response.data.length === 0) {
            return { error: 'Player not found', data: { role: undefined, team: undefined } }
        }

        // Get the first player result
        const player = response.data[0]
        return { 
            data: { 
                role: player.role || undefined, 
                team: player.team || undefined 
            } 
        }
    } catch {
        return { error: 'Failed to fetch player details', data: { role: undefined, team: undefined } }
    }
}

/**
 * Get the best player image for a specific tournament
 * @param name - The player name
 * @param tournament - The tournament name
 * @returns The best matching image URL or null if none found
 */
async function getPlayerTournamentImage(
    name: string,
    tournament: string
): Promise<ApiResponse<string>> {
    const encodedName = encodeURIComponent(name)
    const encodedTournament = encodeURIComponent(tournament)
    
    try {
        const response = await apiRequest<{
            fileName: string;
            link: string;
            team?: string;
            tournament?: string;
            imageType?: string;
            caption?: string;
            isProfileImage?: boolean;
            priority: number;
            reason: string;
            tournamentDate?: string;
            daysDifference?: number;
        }>(`/api/players/name/${encodedName}/tournament/${encodedTournament}/image`)
        
        if (!response.data) {
            return { error: 'No image found for tournament', data: '' }
        }
        
        // Get the actual image URL using the image API
        const imageUrl = response.data.fileName.replace('.png', '.webp')
        const imageCheck = await getPublicPlayerImage(imageUrl)
        
        if (imageCheck.data) {
            return { data: imageCheck.data }
        }
        
        return { error: 'Image file not accessible', data: '' }
    } catch {
        return { error: 'Failed to fetch tournament image', data: '' }
    }
}

/**
 * Get a player by their overview page identifier
 * @param overviewPage - The overview page identifier of the player
 * @returns The complete player data with redirects and images
 */
async function getPlayerByOverviewPage(
    overviewPage: string
): Promise<ApiResponse<PlayerWithRedirects>> {
    const encodedOverviewPage = encodeURIComponent(overviewPage)
    return apiRequest<PlayerWithRedirects>(
        `/api/players/overview/${encodedOverviewPage}`
    )
}

export { 
    getPlayerByExactName,
    getPlayerByLink, 
    getPlayerImages, 
    getPlayerImage, 
    getPlayerTournamentImage,
    getPlayerDetails, 
    getPlayerByOverviewPage
}
