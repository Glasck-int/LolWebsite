import { useState, useEffect, useRef } from 'react'
import { getBatchPlayerImages, getFastBatchPlayerImages, getPlayerImageUrl } from '@/lib/api/playerImages'
import type { BatchPlayerImage, BatchImageResult } from '@/lib/api/playerImages'

interface UseBatchPlayerImagesOptions {
  /**
   * Whether to use the fast endpoint (no tournament context)
   */
  fast?: boolean
  /**
   * Whether to skip Redis cache
   */
  skipCache?: boolean
  /**
   * Debounce delay in milliseconds before fetching
   */
  debounceMs?: number
  /**
   * Whether to fetch images immediately or wait for manual trigger
   */
  autoFetch?: boolean
}

interface PlayerImageData {
  url: string | null
  fileName: string | null
  loading: boolean
  error: string | null
  cached: boolean
}

export function useBatchPlayerImages(
  players: BatchPlayerImage[] | string[],
  options: UseBatchPlayerImagesOptions = {}
) {
  const {
    fast = false,
    skipCache = false,
    debounceMs = 100,
    autoFetch = true
  } = options

  const [images, setImages] = useState<Record<string, PlayerImageData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [performance, setPerformance] = useState<any>(null)
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const abortController = useRef<AbortController | null>(null)

  // Normalize players to always be BatchPlayerImage[]
  const normalizedPlayers: BatchPlayerImage[] = players.map(p => 
    typeof p === 'string' ? { playerName: p } : p
  )

  const fetchImages = async () => {
    // Cancel any pending request
    if (abortController.current) {
      abortController.current.abort()
    }

    if (!normalizedPlayers.length) {
      setImages({})
      return
    }

    abortController.current = new AbortController()
    
    try {
      setLoading(true)
      setError(null)

      // Initialize all players as loading
      const initialImages: Record<string, PlayerImageData> = {}
      normalizedPlayers.forEach(({ playerName }) => {
        const key = playerName
        initialImages[key] = {
          url: null,
          fileName: null,
          loading: true,
          error: null,
          cached: false
        }
      })
      setImages(initialImages)

      let response: any

      if (fast) {
        // Use fast endpoint for simple profile images
        const playerNames = normalizedPlayers.map(p => p.playerName)
        response = await getFastBatchPlayerImages(playerNames)
        
        // Process fast response
        const updatedImages: Record<string, PlayerImageData> = {}
        
        for (const playerName of playerNames) {
          const fileName = response.images[playerName]
          updatedImages[playerName] = {
            url: fileName ? getPlayerImageUrl(playerName) : null,
            fileName,
            loading: false,
            error: fileName ? null : 'No image found',
            cached: false
          }
        }
        
        setImages(updatedImages)
        setPerformance(response.performance)
      } else {
        // Use full-featured endpoint with tournament context
        response = await getBatchPlayerImages(normalizedPlayers, skipCache)
        
        // Process full response
        const updatedImages: Record<string, PlayerImageData> = {}
        
        for (const { playerName, tournament } of normalizedPlayers) {
          const key = `${playerName}:${tournament || 'default'}`
          const result = response.images[key] as BatchImageResult | undefined
          
          if (result) {
            updatedImages[playerName] = {
              url: result.url,
              fileName: result.fileName,
              loading: false,
              error: result.fileName ? null : 'No image found',
              cached: result.cached
            }
          } else {
            updatedImages[playerName] = {
              url: null,
              fileName: null,
              loading: false,
              error: 'Player not found',
              cached: false
            }
          }
        }
        
        setImages(updatedImages)
        setPerformance(response.performance)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled, ignore
        return
      }
      
      console.error('Error fetching batch player images:', err)
      setError(err.message || 'Failed to fetch player images')
      
      // Set all images as errored
      const errorImages: Record<string, PlayerImageData> = {}
      normalizedPlayers.forEach(({ playerName }) => {
        errorImages[playerName] = {
          url: null,
          fileName: null,
          loading: false,
          error: err.message || 'Failed to fetch',
          cached: false
        }
      })
      setImages(errorImages)
    } finally {
      setLoading(false)
      abortController.current = null
    }
  }

  // Effect to handle debounced fetching
  useEffect(() => {
    if (!autoFetch) return

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchImages()
    }, debounceMs)

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [JSON.stringify(normalizedPlayers), fast, skipCache, debounceMs, autoFetch])

  // Manual refetch function
  const refetch = () => {
    fetchImages()
  }

  // Get image data for a specific player
  const getPlayerImage = (playerName: string): PlayerImageData | undefined => {
    return images[playerName]
  }

  // Get URL for a specific player with fallback
  const getPlayerImageUrl = (playerName: string, fallback = true): string => {
    const imageData = images[playerName]
    
    if (imageData?.url) {
      return imageData.url
    }
    
    // Return direct API URL as fallback
    if (fallback) {
      const player = normalizedPlayers.find(p => p.playerName === playerName)
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/players/name/${encodeURIComponent(playerName)}/image${
        player?.tournament ? `?tournament=${encodeURIComponent(player.tournament)}` : ''
      }&fallback=placeholder`
    }
    
    return ''
  }

  return {
    images,
    loading,
    error,
    performance,
    refetch,
    getPlayerImage,
    getPlayerImageUrl
  }
}

/**
 * Hook for a single player image
 */
export function usePlayerImage(
  playerName: string,
  tournament?: string,
  options?: UseBatchPlayerImagesOptions
) {
  const players = tournament 
    ? [{ playerName, tournament }]
    : [playerName]
    
  const result = useBatchPlayerImages(players, options)
  
  return {
    ...result.getPlayerImage(playerName),
    loading: result.loading,
    error: result.error,
    refetch: result.refetch
  }
}