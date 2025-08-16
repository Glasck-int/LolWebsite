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
 * Hook optimisé pour le chargement en batch avec cache unifié
 */
export function useBatchPlayerImages(
  players: Array<{ player: string; role?: string }>,
  tournament?: string
) {
  // Pré-charger les rôles une seule fois
  const uniqueRoles = [...new Set(players.map(p => p.role).filter(Boolean))]
  
  const roleQueries = useQueries({
    queries: uniqueRoles.map(role => ({
      queryKey: ['role-image-global', role],
      queryFn: async () => {
        const response = await getRoleImage(role!)
        return response.data || ''
      },
      staleTime: Infinity,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }))
  })

  // Charger les images de joueurs avec cache unifié
  const playerQueries = useQueries({
    queries: players.map(({ player, role }) => ({
      queryKey: createPlayerImageQueryKey(player, tournament, role),
      queryFn: () => fetchPlayerImageData(player, tournament, role, 'placeholder'),
      enabled: !!player,
      
      // Cache optimisé pour batch loading
      staleTime: 24 * 60 * 60 * 1000, // 24h
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Clé: ne pas refetch si on a déjà les données
      retry: 1,
    }))
  })

  // Combiner les résultats de manière optimisée
  const batchImageData = players.reduce((acc, { player }, index) => {
    const playerQuery = playerQueries[index]
    if (playerQuery.data) {
      acc[player] = playerQuery.data
    }
    return acc
  }, {} as Record<string, PlayerImageData>)

  const isLoading = playerQueries.some(query => query.isLoading) || 
                   roleQueries.some(query => query.isLoading)
  
  const hasError = playerQueries.some(query => query.error) || 
                   roleQueries.some(query => query.error)

  return {
    batchImageData,
    isLoading,
    error: hasError ? 'One or more images failed to load' : null
  }
}