import { ApiResponse, getApiBaseUrl } from './utils'

// Liste des ligues qui ont des images disponibles
const AVAILABLE_LEAGUE_IMAGES = new Set([
    'LoL EMEA Championship',
    'Northern League of Legends Championship',
    'Tencent LoL Pro League',
    'La Ligue Française',
    'League of Legends Championship of The Americas North',
    'League of Legends Championship of The Americas South',
    'Turkish Championship League',
    'EMEA Masters',
    'LoL Champions Korea',
    'Esports World Cup',
    'Mid-Season Invitational',
    'World Championship',
    'First Stand',
    '',

    // Ajoutez ici les noms des ligues pour lesquelles vous avez des images
])

/**
 * Get league image URL without server verification
 *
 * Returns the image URL only if the league is in the predefined list of available images.
 * This approach avoids network requests and 404 errors entirely.
 *
 * @param leagueName - The name of the league to get the image for
 * @returns Promise with image URL if it's in the available list, null otherwise
 */
async function getLeagueImage(
    leagueName: string
): Promise<ApiResponse<string | null>> {
    if (AVAILABLE_LEAGUE_IMAGES.has(leagueName)) {
        const API_BASE_URL = getApiBaseUrl()
        const imageUrl = `${API_BASE_URL}/static/leagues/${leagueName}.webp`

        try {
            const response = await fetch(imageUrl, { method: 'HEAD' })
            if (response.ok) {

                return { data: response.url }
            }
        } catch (error) {
            return { data: null }
        }
        return { data: null }
    }

    return { data: null }
}

async function getTeamImage(
    image: string
): Promise<ApiResponse<string | null>> {
    if (!image || image.trim() === '') {
        return { data: null }
    }
    // console.log('image', image)
    
    const API_BASE_URL = getApiBaseUrl()
    const imageUrl = `${API_BASE_URL}/static/teamPng/${image}`
    
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' })
        if (response.ok) {
            return { data: imageUrl }
        }
    } catch (error) {
        return { data: null }
    }
    return { data: null }
}

async function getPublicPlayerImage(
    image: string
): Promise<ApiResponse<string | null>> {
    const API_BASE_URL = getApiBaseUrl()
    const imageUrl = `${API_BASE_URL}/static/playerWebp/${image}`
    
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' })
        if (response.ok) {
            return { data: response.url }
        }
        console.log('imageUrl', imageUrl, 'response', response)
        return { data: null }
    } catch (error) {
        return { data: null }
    }
}

async function getTeamImageByName(
    teamName: string
): Promise<ApiResponse<string | null>> {
    if (!teamName || teamName.trim() === '') {
        return { data: null }
    }
    // console.log('teamName', teamName)
    const API_BASE_URL = getApiBaseUrl()
    // Essayer différents formats de noms d'images
    const possibleNames = [
        `${teamName}.webp`,
        `${teamName}.png`,
        `${teamName.replace(/ /g, '_')}.webp`,
        `${teamName.replace(/ /g, '_')}.png`,
        `${teamName.replace(/[^a-zA-Z0-9]/g, '')}.webp`,
        `${teamName.replace(/[^a-zA-Z0-9]/g, '')}.png`
    ]
    
    for (const imageName of possibleNames) {
        const imageUrl = `${API_BASE_URL}/static/teamPng/${imageName}`
        try {
            const response = await fetch(imageUrl, { method: 'HEAD' })
            if (response.ok) {
                return { data: imageUrl }
            }
        } catch (error) {
            // Continue to next possibility
        }
    }
    
    return { data: null }
}

export { getLeagueImage, getTeamImage, getPublicPlayerImage, getTeamImageByName }
