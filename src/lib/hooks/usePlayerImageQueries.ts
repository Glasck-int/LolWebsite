import { useQuery, useQueries } from '@tanstack/react-query'
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
 * Custom hook for caching player images with React Query
 * Provides persistent caching across page reloads and navigation
 * Equivalent to the previous usePlayerImageCache SWR hook
 */
export function usePlayerImageCache(
  playerName: string,
  options: UsePlayerImageCacheOptions = {}
) {
  const { tournament, fallback = 'placeholder' } = options
  
  const { data, error, isLoading } = useQuery({
    queryKey: ['player-image', playerName, tournament || 'default'],
    queryFn: async (): Promise<PlayerImageData> => {
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
        }
        
      } catch (error) {
        console.error(`Failed to fetch image for player ${playerName}:`, error)
        return {
          playerImage: '',
          teamImage: '',
          roleImage: ''
        }
      }
    },
    enabled: !!playerName,
    
    // Very aggressive caching equivalent to SWR settings
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - data stays fresh
    gcTime: 24 * 60 * 60 * 1000, // 24 hours garbage collection
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Revalidate on mount to ensure we have the image
    retry: 1,
    retryOnMount: false,
  })

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
  const { data, error, isLoading } = useQuery({
    queryKey: ['role-image', role],
    queryFn: async (): Promise<string> => {
      const response = await getRoleImage(role)
      return response.data || ''
    },
    enabled: !!role,
    
    // Very aggressive caching - roles change very rarely
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    retry: 1,
    retryOnMount: false,
  })

  return {
    roleImage: data,
    isLoading,
    error
  }
}

/**
 * Hook for batch loading multiple player images efficiently using useQueries
 * Equivalent to the previous useBatchPlayerImages SWR hook
 */
export function useBatchPlayerImages(
  players: Array<{ player: string; role?: string }>,
  tournament?: string
) {
  // Create queries for all players
  const playerQueries = useQueries({
    queries: players.map(({ player, role }) => ({
      queryKey: ['batch-player-image', player, tournament || 'default', role],
      queryFn: async (): Promise<PlayerImageData> => {
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
          
          return {
            playerImage: playerImageResponse.data || '',
            teamImage: '',
            roleImage: roleImageResponse.data || ''
          }
        } catch (error) {
          console.error(`Failed to fetch data for player ${player}:`, error)
          return {
            playerImage: '',
            teamImage: '',
            roleImage: ''
          }
        }
      },
      enabled: !!player,
      
      // Very aggressive caching - cache very persistent
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true, // Don't refetch on mount
      retry: 1,
      retryOnMount: false,
    }))
  })

  // Transform results into the expected format
  const batchImageData = players.reduce((acc, { player }, index) => {
    const query = playerQueries[index]
    if (query.data) {
      acc[player] = query.data
    }
    return acc
  }, {} as Record<string, PlayerImageData>)

  const isLoading = playerQueries.some(query => query.isLoading)
  const hasError = playerQueries.some(query => query.error)

  return {
    batchImageData,
    isLoading,
    error: hasError ? 'One or more player images failed to load' : null
  }
}