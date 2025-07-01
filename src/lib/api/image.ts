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
        return { data: imageUrl }
    }

    return { data: null }
}

export { getLeagueImage }
