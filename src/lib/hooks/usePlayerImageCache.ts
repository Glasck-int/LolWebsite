import useSWR from 'swr'
import { getPlayerImageFromBackend, getRoleImage } from '@/lib/api/image'
import { getPlayerTournamentImage, getPlayerImage } from '@/lib/api/player'

interface PlayerImageData {
  playerImage: string
  teamImage: string
  roleImage: string
}

interface UsePlayerImageCacheOptions {
  tournament?: string
  fallback?: 'placeholder' | 'none'
}

/**
 * Custom hook for caching player images with SWR
 * Provides persistent caching across page reloads and navigation
 */
export function usePlayerImageCache(
  playerName: string,
  options: UsePlayerImageCacheOptions = {}
) {
  const { tournament, fallback = 'placeholder' } = options
  
  // Create a stable cache key
  const cacheKey = playerName && tournament 
    ? `player-image-${playerName}-${tournament}` 
    : playerName 
    ? `player-image-${playerName}-default`
    : null

  const { data, error, isLoading } = useSWR(
    cacheKey,
    async () => {
      try {
        // Try backend first with fallback parameter
        let playerImageResponse = await getPlayerImageFromBackend(playerName, {
          tournament,
          fallback
        })
        
        // If backend didn't return an image URL, try legacy methods
        if (!playerImageResponse.data && tournament) {
          playerImageResponse = await getPlayerTournamentImage(playerName, tournament)
          
          if (!playerImageResponse.data) {
            playerImageResponse = await getPlayerImage(playerName, tournament)
          }
        }
        
        return {
          playerImage: playerImageResponse.data || '',
          teamImage: '', // Not implemented yet
          roleImage: '' // Will be fetched separately
        } as PlayerImageData
        
      } catch (error) {
        console.error(`Failed to fetch image for player ${playerName}:`, error)
        return {
          playerImage: '',
          teamImage: '',
          roleImage: ''
        } as PlayerImageData
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false, // Don't refetch if data exists
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours deduplication - très agressif
      refreshInterval: 0, // No automatic refresh
      errorRetryCount: 1,
      shouldRetryOnError: false,
      focusThrottleInterval: 24 * 60 * 60 * 1000, // 24 hours - très agressif
      revalidateOnMount: true // Revalider au montage pour s'assurer d'avoir l'image
    }
  )

  return {
    imageData: data,
    isLoading,
    error
  }
}

/**
 * Hook specifically for role images with caching
 */
export function useRoleImageCache(role: string) {
  const cacheKey = role ? `role-image-${role}` : null

  const { data, error, isLoading } = useSWR(
    cacheKey,
    async () => {
      const response = await getRoleImage(role)
      return response.data || ''
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours - roles changent très rarement
      refreshInterval: 0,
      errorRetryCount: 1,
      shouldRetryOnError: false,
      revalidateOnMount: true
    }
  )

  return {
    roleImage: data,
    isLoading,
    error
  }
}

/**
 * Hook for batch loading multiple player images efficiently
 */
export function useBatchPlayerImages(
  players: Array<{ player: string; role?: string }>,
  tournament?: string
) {
  const cacheKey = players.length > 0 && tournament
    ? `batch-images-${tournament}-${players.map(p => p.player).join(',')}`
    : players.length > 0
    ? `batch-images-default-${players.map(p => p.player).join(',')}`
    : null

  const { data, error, isLoading } = useSWR(
    cacheKey,
    async () => {
      const results: Record<string, PlayerImageData> = {}
      
      // Process all players in parallel
      await Promise.allSettled(
        players.map(async ({ player, role }) => {
          try {
            // Get player image
            let playerImageResponse = await getPlayerImageFromBackend(player, {
              tournament,
              fallback: 'placeholder'
            })
            
            if (!playerImageResponse.data && tournament) {
              playerImageResponse = await getPlayerTournamentImage(player, tournament)
              
              if (!playerImageResponse.data) {
                playerImageResponse = await getPlayerImage(player, tournament)
              }
            }
            
            // Get role image
            const roleImageResponse = role ? await getRoleImage(role) : { data: '' }
            
            results[player] = {
              playerImage: playerImageResponse.data || '',
              teamImage: '',
              roleImage: roleImageResponse.data || ''
            }
          } catch (error) {
            console.error(`Failed to fetch data for player ${player}:`, error)
            results[player] = {
              playerImage: '',
              teamImage: '',
              roleImage: ''
            }
          }
        })
      )
      
      return results
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 24 * 60 * 60 * 1000, // 24 hours - cache très persistant
      refreshInterval: 0,
      errorRetryCount: 1,
      shouldRetryOnError: false,
      revalidateOnMount: true // pas refetch au montage
    }
  )

  return {
    batchImageData: data,
    isLoading,
    error
  }
}