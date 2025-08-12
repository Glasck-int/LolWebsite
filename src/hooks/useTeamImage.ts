'use client'

import { useState, useEffect } from 'react'
import { getTeamImageByName } from '@/lib/api/image'

interface UseTeamImageReturn {
    teamImage: string | null
    loading: boolean
    error: string | null
}

/**
 * Hook to fetch team image by team overview page/name
 * 
 * @param teamOverviewPage - The overview page/name of the team to get image for
 * @returns Object containing team image URL, loading state, and error
 */
export function useTeamImage(teamOverviewPage: string | null | undefined): UseTeamImageReturn {
    const [teamImage, setTeamImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!teamOverviewPage) {
            setTeamImage(null)
            setLoading(false)
            setError(null)
            return
        }

        let isCancelled = false

        const fetchTeamImage = async () => {
            setLoading(true)
            setError(null)

            try {
                console.log(`🖼️ [TEAM IMAGE HOOK] Fetching image for team: ${teamOverviewPage}`)
                
                const result = await getTeamImageByName(teamOverviewPage)
                
                if (isCancelled) return

                if (result.error) {
                    setError(result.error)
                    setTeamImage(null)
                    console.error(`❌ [TEAM IMAGE HOOK] Error fetching team image:`, result.error)
                } else if (result.data) {
                    setTeamImage(result.data)
                    console.log(`✅ [TEAM IMAGE HOOK] Successfully fetched team image for: ${teamOverviewPage}`)
                } else {
                    setTeamImage(null)
                    console.log(`⚠️ [TEAM IMAGE HOOK] No image found for team: ${teamOverviewPage}`)
                }
            } catch (err) {
                if (isCancelled) return
                
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                setError(errorMessage)
                setTeamImage(null)
                console.error(`❌ [TEAM IMAGE HOOK] Exception fetching team image:`, err)
            } finally {
                if (!isCancelled) {
                    setLoading(false)
                }
            }
        }

        fetchTeamImage()

        return () => {
            isCancelled = true
        }
    }, [teamOverviewPage])

    return {
        teamImage,
        loading,
        error
    }
}