import { unstable_cache } from 'next/cache'

interface CachedPlayerImage {
  fileName: string
  url: string
  priority: number
  reason: string
}

/**
 * Server-side cached function to get player image
 * Uses Next.js unstable_cache for persistent server caching
 */
export const getCachedPlayerImage = unstable_cache(
  async (playerName: string, tournament?: string): Promise<CachedPlayerImage | null> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const encodedName = encodeURIComponent(playerName)
      
      let url: string
      if (tournament) {
        const encodedTournament = encodeURIComponent(tournament)
        url = `${baseUrl}/api/players/name/${encodedName}/tournament/${encodedTournament}/image`
      } else {
        url = `${baseUrl}/api/players/name/${encodedName}/image?fallback=placeholder`
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      return {
        fileName: data.fileName,
        url: `${baseUrl}/api/players/name/${encodedName}/image${tournament ? `?tournament=${encodeURIComponent(tournament)}` : ''}`,
        priority: data.priority || 0,
        reason: data.reason || 'Server cached'
      }
    } catch (error) {
      console.error(`Failed to fetch cached player image for ${playerName}:`, error)
      return null
    }
  },
  ['player-image'], // Cache key prefix
  {
    revalidate: 3600, // Revalidate every hour
    tags: ['player-images'] // Cache tags for invalidation
  }
)

/**
 * Server-side cached function to get role image
 */
export const getCachedRoleImage = unstable_cache(
  async (role: string): Promise<string | null> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/roles/${encodeURIComponent(role)}/image`)
      
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.url || null
    } catch (error) {
      console.error(`Failed to fetch cached role image for ${role}:`, error)
      return null
    }
  },
  ['role-image'],
  {
    revalidate: 86400, // Revalidate once per day (roles don't change often)
    tags: ['role-images']
  }
)

/**
 * Batch function to get multiple player images efficiently
 * Uses Promise.allSettled to handle failures gracefully
 */
export const getCachedBatchPlayerImages = unstable_cache(
  async (
    players: Array<{ playerName: string; role?: string }>, 
    tournament?: string
  ): Promise<Record<string, { playerImage: CachedPlayerImage | null; roleImage: string | null }>> => {
    const results: Record<string, { playerImage: CachedPlayerImage | null; roleImage: string | null }> = {}
    
    // Process all players in parallel
    const promises = players.map(async ({ playerName, role }) => {
      const [playerImageResult, roleImageResult] = await Promise.allSettled([
        getCachedPlayerImage(playerName, tournament),
        role ? getCachedRoleImage(role) : Promise.resolve(null)
      ])
      
      results[playerName] = {
        playerImage: playerImageResult.status === 'fulfilled' ? playerImageResult.value : null,
        roleImage: roleImageResult.status === 'fulfilled' ? roleImageResult.value : null
      }
    })
    
    await Promise.allSettled(promises)
    return results
  },
  ['batch-player-images'],
  {
    revalidate: 3600,
    tags: ['player-images', 'role-images']
  }
)

/**
 * Utility function to invalidate player image caches
 * Useful when player images are updated
 */
export async function invalidatePlayerImageCache() {
  // This would require the next/cache revalidateTag function
  // revalidateTag('player-images')
  console.log('Player image cache invalidation requested')
}