import { API_BASE_URL } from './config'

export interface BatchPlayerImage {
  playerName: string
  tournament?: string
}

export interface BatchImageResult {
  fileName: string | null
  url: string | null
  cached: boolean
  priority: number
  reason: string
}

export interface BatchImagesResponse {
  images: Record<string, BatchImageResult>
  performance: {
    cacheHits: number
    cacheMisses: number
    dbQueryTime: number
  }
}

export interface FastBatchImagesResponse {
  images: Record<string, string | null>
  performance: {
    queryTime: number
    playersProcessed: number
  }
}

/**
 * Fetch multiple player images in a single optimized request
 * Supports tournament context for better image selection
 */
export async function getBatchPlayerImages(
  players: BatchPlayerImage[],
  skipCache = false
): Promise<BatchImagesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/players/images/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ players, skipCache }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch batch player images: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching batch player images:', error)
    throw error
  }
}

/**
 * Fast batch endpoint for profile images only - maximum performance
 * Use this when you don't need tournament-specific images
 */
export async function getFastBatchPlayerImages(
  playerNames: string[]
): Promise<FastBatchImagesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/players/images/batch/fast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerNames }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch fast batch player images: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching fast batch player images:', error)
    throw error
  }
}

/**
 * Get a single player image URL
 * Falls back to placeholder if not found
 */
export function getPlayerImageUrl(
  playerName: string,
  tournament?: string,
  fallback: 'placeholder' | 'none' = 'placeholder'
): string {
  const params = new URLSearchParams()
  if (tournament) params.append('tournament', tournament)
  if (fallback) params.append('fallback', fallback)
  
  const queryString = params.toString()
  const url = `${API_BASE_URL}/players/name/${encodeURIComponent(playerName)}/image`
  
  return queryString ? `${url}?${queryString}` : url
}