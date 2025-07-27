'use client'

import { useState, useEffect } from 'react'
import { MatchSchedule } from '@/generated/prisma'
import { 
    getMatchesForTournament 
} from '@/lib/api/tournaments'
import { getTeamsByNames } from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'

interface UseNextMatchesResult {
    matches: MatchSchedule[]
    teamsData: Array<{
        short?: string | null
        image?: string | null
        overviewPage?: string | null
    }>
    teamImages: Array<{
        team1Image?: string | null
        team2Image?: string | null
    }>
    loading: boolean
    error: string | null
    lastMatches: boolean
}

/**
 * Hook pour récupérer les prochains matches d'un tournoi côté client
 * Inclut automatiquement les données des équipes et leurs images
 * 
 * @param tournamentId - ID du tournoi (peut être null)
 * @returns Données des matches avec équipes et images, état de chargement et erreur
 */
export const useNextMatches = (tournamentId: number | null): UseNextMatchesResult => {
    const [matches, setMatches] = useState<MatchSchedule[]>([])
    const [teamsData, setTeamsData] = useState<Array<{
        short?: string | null
        image?: string | null
        overviewPage?: string | null
    }>>([])
    const [teamImages, setTeamImages] = useState<Array<{
        team1Image?: string | null
        team2Image?: string | null
    }>>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastMatches, setLastMatches] = useState(false)

    useEffect(() => {
        if (!tournamentId) {
            setMatches([])
            setTeamsData([])
            setTeamImages([])
            setLoading(false)
            setError(null)
            setLastMatches(false)
            return
        }

        const fetchMatches = async () => {
            try {
                setLoading(true)
                setError(null)

                // Utiliser la nouvelle route qui gère la logique côté serveur
                const matchesResponse = await getMatchesForTournament(tournamentId.toString())

                if (matchesResponse.error) {
                    throw new Error(matchesResponse.error)
                }

                if (!matchesResponse.data) {
                    throw new Error('No data received from API')
                }

                const fetchedMatches = matchesResponse.data.data || []
                const isLastMatches = matchesResponse.data.type === 'last'
                
                setMatches(fetchedMatches)
                setLastMatches(isLastMatches)

                if (fetchedMatches.length === 0) {
                    setTeamsData([])
                    setTeamImages([])
                    return
                }

                // Récupérer les noms des équipes uniques
                const teamNames = new Set<string>()
                fetchedMatches.forEach((match) => {
                    if (match.team1) teamNames.add(match.team1)
                    if (match.team2) teamNames.add(match.team2)
                })

                // Récupérer les données des équipes
                const teamsResponse = await getTeamsByNames(Array.from(teamNames))
                const teams = teamsResponse.data || []
                setTeamsData(teams)

                // Récupérer les images des équipes pour chaque match
                const images = await Promise.all(
                    fetchedMatches.map(async (match) => {
                        const team1 = teams.find(
                            (team) => team.overviewPage === match.team1
                        )
                        const team2 = teams.find(
                            (team) => team.overviewPage === match.team2
                        )

                        const [team1ImageResponse, team2ImageResponse] = await Promise.all([
                            getTeamImage(team1?.image?.replace('.png', '.webp') || ''),
                            getTeamImage(team2?.image?.replace('.png', '.webp') || '')
                        ])

                        return {
                            team1Image: team1ImageResponse.data,
                            team2Image: team2ImageResponse.data,
                        }
                    })
                )

                setTeamImages(images)

            } catch (err) {
                console.error('Error fetching matches:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch matches')
                setMatches([])
                setTeamsData([])
                setTeamImages([])
                setLastMatches(false)
            } finally {
                setLoading(false)
            }
        }

        fetchMatches()
    }, [tournamentId])

    return {
        matches,
        teamsData,
        teamImages,
        loading,
        error,
        lastMatches
    }
}