import {PlayerWithRedirectsListResponse as PlayerWithRedirectsListResponseType } from '../../../backend/src/schemas/players'
import { apiRequest, ApiResponse } from './utils'
import { PlayerImageType } from '@Glasck-int/glasck-types'
import { getPublicPlayerImage } from './image'

/**
 * Get a player by their link
 * @warning This is A Fuzzy Search, so it will return all players that contain the link in their name
 * @param link - The link of the player to get
 * @returns The player with the given link
 */
async function getPlayerByLink(
    link: string
): Promise<ApiResponse<typeof PlayerWithRedirectsListResponseType>> {
    const encodedLink = encodeURIComponent(link)
    return apiRequest<typeof PlayerWithRedirectsListResponseType>(
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

export { getPlayerByLink, getPlayerImages, getPlayerImage }
