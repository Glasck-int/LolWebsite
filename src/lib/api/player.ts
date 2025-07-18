import { PlayerWithRedirectsListResponse as PlayerWithRedirectsListResponseType } from '../../../backend/src/schemas/players'
import { apiRequest, ApiResponse } from './utils'


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

export { getPlayerByLink }
