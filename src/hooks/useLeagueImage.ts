'use client'

import { useState, useEffect } from 'react'
import { getLeagueImage } from '@/lib/api/image'

interface UseLeagueImageReturn {
    leagueImage: string | null
    loading: boolean
    error: string | null
}

/**
 * Hook to fetch league image by league name
 * 
 * @param leagueName - The name of the league to get image for
 * @returns Object containing league image URL, loading state, and error
 */
export function useLeagueImage(leagueName: string | null | undefined): UseLeagueImageReturn {
    const [leagueImage, setLeagueImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!leagueName) {
            setLeagueImage(null)
            setLoading(false)
            setError(null)
            return
        }

        let isCancelled = false

        const fetchLeagueImage = async () => {
            setLoading(true)
            setError(null)

            try {
                
                const result = await getLeagueImage(leagueName)
                
                if (isCancelled) return

                if (result.error) {
                    setError(result.error)
                    setLeagueImage(null)
                } else if (result.data) {
                    setLeagueImage(result.data)
                } else {
                    setLeagueImage(null)
                }
            } catch (err) {
                if (isCancelled) return
                
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                setError(errorMessage)
                setLeagueImage(null)
            } finally {
                if (!isCancelled) {
                    setLoading(false)
                }
            }
        }

        fetchLeagueImage()

        return () => {
            isCancelled = true
        }
    }, [leagueName])

    return {
        leagueImage,
        loading,
        error
    }
}