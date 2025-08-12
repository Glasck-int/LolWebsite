'use client'

import { useState, useEffect } from 'react'
import { getPlayerTeamInTournament } from '@/lib/api/teams'

interface TournamentPlayerTeamReturn {
    teamData: { name: string; overviewPage?: string; image?: string } | null
    loading: boolean
    error: string | null
}

/**
 * Hook to fetch team information for a specific player in a tournament
 * 
 * @param tournamentId - The ID of the tournament 
 * @param playerName - The name/link of the player
 * @returns Object containing team data, loading state, and error
 */
export function useTournamentPlayerTeam(tournamentId: string | number | null, playerName: string): TournamentPlayerTeamReturn {
    const [teamData, setTeamData] = useState<{ name: string; overviewPage?: string; image?: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!tournamentId || !playerName) {
            setTeamData(null)
            setLoading(false)
            setError(null)
            return
        }

        let isCancelled = false

        const fetchPlayerTeam = async () => {
            setLoading(true)
            setError(null)

            try {
                
                const result = await getPlayerTeamInTournament(tournamentId.toString(), playerName)
                
                if (isCancelled) return

                if (result.error) {
                    setError(result.error)
                    setTeamData(null)
                    console.error(`❌ [PLAYER TEAM HOOK] Error fetching player team:`, result.error)
                } else if (result.data) {
                    setTeamData(result.data)
                }
            } catch (err) {
                if (isCancelled) return
                
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                setError(errorMessage)
                setTeamData(null)
            } finally {
                if (!isCancelled) {
                    setLoading(false)
                }
            }
        }

        fetchPlayerTeam()

        return () => {
            isCancelled = true
        }
    }, [tournamentId, playerName])

    return {
        teamData,
        loading,
        error
    }
}