'use client'

import { useState, useEffect } from 'react'
import { getTournamentWithLeague } from '@/lib/api/tournaments'
import { League as LeagueType } from '@/generated/prisma'

interface UseTournamentLeagueReturn {
    leagueData: LeagueType | null
    loading: boolean
    error: string | null
}

/**
 * Hook to fetch league information for a specific tournament
 * 
 * @param tournamentId - The ID of the tournament to get league info for
 * @returns Object containing league data, loading state, and error
 */
export function useTournamentLeague(tournamentId: string | number | null): UseTournamentLeagueReturn {
    const [leagueData, setLeagueData] = useState<LeagueType | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!tournamentId) {
            setLeagueData(null)
            setLoading(false)
            setError(null)
            return
        }

        let isCancelled = false

        const fetchTournamentLeague = async () => {
            setLoading(true)
            setError(null)

            try {
                console.log(`🔄 [HOOK] Fetching league for tournament ID: ${tournamentId}`)
                
                const result = await getTournamentWithLeague(tournamentId)
                
                if (isCancelled) return

                if (result.error) {
                    setError(result.error)
                    setLeagueData(null)
                    console.error(`❌ [HOOK] Error fetching tournament league:`, result.error)
                } else if (result.data) {
                    setLeagueData(result.data.League)
                    console.log(`✅ [HOOK] Successfully fetched league:`, {
                        tournamentName: result.data.name,
                        leagueName: result.data.League?.name || 'No league',
                        leagueShort: result.data.League?.short || 'N/A'
                    })
                }
            } catch (err) {
                if (isCancelled) return
                
                const errorMessage = err instanceof Error ? err.message : 'Unknown error'
                setError(errorMessage)
                setLeagueData(null)
                console.error(`❌ [HOOK] Exception fetching tournament league:`, err)
            } finally {
                if (!isCancelled) {
                    setLoading(false)
                }
            }
        }

        fetchTournamentLeague()

        return () => {
            isCancelled = true
        }
    }, [tournamentId])

    return {
        leagueData,
        loading,
        error
    }
}