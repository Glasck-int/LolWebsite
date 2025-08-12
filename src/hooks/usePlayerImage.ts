'use client'

import { useState, useEffect } from 'react'
import { getPlayerImageByName } from '@/lib/api/image'

interface UsePlayerImageReturn {
    playerImage: string | null
    loading: boolean
    error: string | null
}

/**
 * Hook to fetch player image by player name/link
 * 
 * @param playerName - The name/link of the player to get image for
 * @returns Object containing player image URL, loading state, and error
 */
export function usePlayerImage(playerName: string | null | undefined): UsePlayerImageReturn {
    const [playerImage, setPlayerImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!playerName) {
            setPlayerImage(null)
            setLoading(false)
            setError(null)
            return
        }

        let isCancelled = false

        const fetchPlayerImage = async () => {
            setLoading(true)
            setError(null)

            try {
                console.log(`🖼️ [PLAYER IMAGE HOOK] Fetching image for player: ${playerName}`)
                
                const result = await getPlayerImageByName(playerName)
                
                if (isCancelled) return

                if (result.error) {
                    setError(result.error)
                    setPlayerImage(null)
                    console.error(`❌ [PLAYER IMAGE HOOK] Error fetching player image:`, result.error)
                } else if (result.data) {
                    setPlayerImage(result.data)
                    console.log(`✅ [PLAYER IMAGE HOOK] Successfully fetched player image for: ${playerName}`)
                } else {
                    setPlayerImage(null)
                    console.log(`⚠️ [PLAYER IMAGE HOOK] No image found for player: ${playerName}`)
                }
            } catch (err) {
                if (isCancelled) return
                
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                setError(errorMessage)
                setPlayerImage(null)
                console.error(`❌ [PLAYER IMAGE HOOK] Exception fetching player image:`, err)
            } finally {
                if (!isCancelled) {
                    setLoading(false)
                }
            }
        }

        fetchPlayerImage()

        return () => {
            isCancelled = true
        }
    }, [playerName])

    return {
        playerImage,
        loading,
        error
    }
}