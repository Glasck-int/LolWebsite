import React from 'react'
import { useQuery } from '@tanstack/react-query'
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
 * Fonction de cache unifiée pour les images de joueurs
 * Évite la duplication et optimise le cache
 */
function createPlayerImageQueryKey(playerName: string, tournament?: string, role?: string) {
  return ['player-image-unified', playerName, tournament || 'default', role || 'no-role'] as const
}

/**
 * Fonction de fetch unifiée pour les images de joueurs
 */
async function fetchPlayerImageData(
  playerName: string, 
  tournament?: string, 
  role?: string, 
  fallback: 'placeholder' | 'none' = 'placeholder'
): Promise<PlayerImageData> {
  try {
    // Fetch player image
    let playerImageResponse = await getPlayerImageFromBackend(playerName, {
      tournament,
      fallback
    })
    
    // Fallback methods si nécessaire
    if (!playerImageResponse.data && tournament) {
      playerImageResponse = await getPlayerTournamentImage(playerName, tournament)
      
      if (!playerImageResponse.data) {
        playerImageResponse = await getPlayerImage(playerName, tournament)
      }
    }
    
    // Fetch role image
    const roleImageResponse = role ? await getRoleImage(role) : { data: '' }
    
    return {
      playerImage: playerImageResponse.data || '',
      teamImage: '',
      roleImage: roleImageResponse.data || ''
    }
  } catch (error) {
    console.error(`Failed to fetch data for player ${playerName}:`, error)
    return {
      playerImage: '',
      teamImage: '',
      roleImage: ''
    }
  }
}

/**
 * Hook optimisé pour une seule image de joueur
 */
export function usePlayerImageCache(
  playerName: string,
  options: UsePlayerImageCacheOptions = {}
) {
  const { tournament, fallback = 'placeholder' } = options
  
  const { data, error, isLoading } = useQuery({
    queryKey: createPlayerImageQueryKey(playerName, tournament),
    queryFn: () => fetchPlayerImageData(playerName, tournament, undefined, fallback),
    enabled: !!playerName,
    
    // Cache très agressif - 24h
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // Important: ne pas refetch si on a déjà les données
    retry: 1,
  })

  return {
    imageData: data,
    isLoading,
    error
  }
}

/**
 * Hook optimisé pour le cache des rôles (partagé globalement)
 */
export function useRoleImageCache(role: string) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['role-image-global', role],
    queryFn: async (): Promise<string> => {
      const response = await getRoleImage(role)
      return response.data || ''
    },
    enabled: !!role,
    
    // Cache global très agressif pour les rôles
    staleTime: Infinity, // Jamais stale
    gcTime: 24 * 60 * 60 * 1000, // 24h de conservation
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  })

  return {
    roleImage: data,
    isLoading,
    error
  }
}


/**
 * Fetch individuel pour tous les joueurs (méthode simplifiée sans batch)
 */
async function fetchAllPlayerImagesIndividual(
  players: Array<{ player: string; role?: string }>,
  tournament?: string
): Promise<Record<string, PlayerImageData>> {
  const results: Record<string, PlayerImageData> = {}
  
  const playerPromises = players.map(async ({ player, role }) => {
    try {
      const data = await fetchPlayerImageData(player, tournament, role, 'placeholder')
      return { player, data }
    } catch (error) {
      console.error(`Failed to fetch data for player ${player}:`, error)
      return { 
        player, 
        data: { playerImage: '', teamImage: '', roleImage: '' } as PlayerImageData 
      }
    }
  })
  
  const playerResults = await Promise.allSettled(playerPromises)
  
  playerResults.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      results[result.value.player] = result.value.data
    }
  })
  
  return results
}

/**
 * Hook pour le chargement individuel de toutes les images de joueurs
 */
export function useBatchPlayerImages(
  players: Array<{ player: string; role?: string }>,
  tournament?: string
) {
  // Créer une clé de cache unique pour ce groupe de joueurs
  const playersKey = players
    .map(p => `${p.player}-${p.role || 'no-role'}`)
    .sort() // Trier pour avoir une clé stable
    .join(',')
  
  const { data, error, isLoading } = useQuery({
    queryKey: ['individual-player-images', tournament || 'default', playersKey],
    queryFn: async () => {
      console.log('🎯 Fetching individual images for players:', players.length)
      const result = await fetchAllPlayerImagesIndividual(players, tournament)
      console.log('✅ Individual result:', Object.keys(result).length, 'players loaded')
      return result
    },
    enabled: players.length > 0,
    
    // Cache agressif 
    staleTime: 24 * 60 * 60 * 1000, // 24h
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Ne pas refetch si on a déjà les données
    retry: 1,
  })

  // Debug dans le hook
  React.useEffect(() => {
    if (data) {
      console.log('🔍 Individual data received:', Object.keys(data).length, 'players')
      console.log('🔍 Sample data:', Object.entries(data).slice(0, 2))
    }
    if (error) {
      console.error('❌ Individual error:', error)
    }
  }, [data, error])

  return {
    batchImageData: data || {},
    isLoading,
    error: error?.message || null
  }
}