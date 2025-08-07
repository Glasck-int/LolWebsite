'use client'

import React, { useEffect, useState, useCallback } from 'react'
import ChoseDate, { useChoseDate } from '@/components/ui/calendar/ChoseDate'
import { Card, CardBody } from '@/components/ui/card'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { MatchSchedule } from '@/generated/prisma'

interface MatchesCalendarProps {
    tournamentId: string
}

interface TournamentInfo {
    id: number
    dateStart: string
    dateEnd: string | null
}

// Type pour les matchs avec leurs games
type MatchWithGames = MatchSchedule & {
    MatchScheduleGame?: Array<{
        id: number
        gameId: string | null
        nGameInMatch: number
        winner: number | null
        blue: string | null
        red: string | null
    }>
}

interface MatchesResponse {
    data: MatchWithGames[]
    pagination: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

export const MatchesCalendar: React.FC<MatchesCalendarProps> = ({ tournamentId }) => {
    const choseDateProps = useChoseDate()
    const { selectedDate, isLive, matchChaud, search } = choseDateProps
    const [matches, setMatches] = useState<MatchWithGames[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [tournamentInfo, setTournamentInfo] = useState<TournamentInfo | null>(null)
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
    })
    const t = useTranslate('Matches')

    // Fetch tournament info to get date boundaries
    useEffect(() => {
        const fetchTournamentInfo = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/tournaments/id/${tournamentId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data && data.length > 0) {
                        setTournamentInfo(data[0])
                        
                        // Initialize selected date to tournament start date if not set
                        const tournamentStart = new Date(data[0].dateStart)
                        const today = new Date()
                        
                        // If tournament hasn't started yet, set to start date
                        // If tournament is ongoing, set to today
                        // If tournament is finished, set to start date
                        if (tournamentStart > today) {
                            choseDateProps.setSelectedDate(tournamentStart)
                        } else if (data[0].dateEnd && new Date(data[0].dateEnd) < today) {
                            choseDateProps.setSelectedDate(tournamentStart)
                        }
                        // Otherwise keep current date (today)
                    }
                }
            } catch (err) {
                console.error('Error fetching tournament info:', err)
            }
        }

        if (tournamentId) {
            fetchTournamentInfo()
        }
    }, [tournamentId])

    const fetchMatches = useCallback(async (date: Date, offset = 0) => {
        if (!tournamentId) return

        setLoading(true)
        setError(null)

        try {
            // Format date to YYYY-MM-DD in local timezone, not UTC
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            
            // Temporairement, utilisons la route existante qui fonctionne
            const response = await fetch(
                `http://localhost:3001/api/tournaments/id/${tournamentId}/matches?type=auto&limit=0`
            )

            if (!response.ok) {
                if (response.status === 404) {
                    setMatches([])
                    setPagination({
                        total: 0,
                        limit: 50,
                        offset: 0,
                        hasMore: false
                    })
                    return
                }
                throw new Error('Failed to fetch matches')
            }

            const data = await response.json()
            
            // Filtrer les matchs pour la date sélectionnée
            // Important: créer les dates en UTC pour correspondre aux données
            const startOfDay = new Date(date)
            startOfDay.setHours(0, 0, 0, 0)
            const endOfDay = new Date(date)
            endOfDay.setHours(23, 59, 59, 999)
            
            const filteredMatches = data.data.filter((match: MatchWithGames) => {
                const matchDate = new Date(match.dateTime_UTC)
                // Comparer les dates en utilisant le même fuseau horaire
                const matchLocalDate = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate())
                const selectedLocalDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                return matchLocalDate.getTime() === selectedLocalDate.getTime()
            })
            
            if (offset === 0) {
                setMatches(filteredMatches)
            } else {
                setMatches(prev => [...prev, ...filteredMatches])
            }
            
            setPagination({
                total: filteredMatches.length,
                limit: 50,
                offset: 0,
                hasMore: false
            })
        } catch (err) {
            console.error('Error fetching matches:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [tournamentId])

    useEffect(() => {
        fetchMatches(selectedDate, 0)
    }, [selectedDate, fetchMatches])

    const loadMore = () => {
        if (!pagination.hasMore || loading) return
        fetchMatches(selectedDate, pagination.offset + pagination.limit)
    }

    const filteredMatches = matches.filter(match => {
        if (search) {
            const searchLower = search.toLowerCase()
            return (
                match.team1?.toLowerCase().includes(searchLower) ||
                match.team2?.toLowerCase().includes(searchLower)
            )
        }
        return true
    })

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getMatchStatus = (match: MatchWithGames) => {
        const now = new Date()
        const matchDate = new Date(match.dateTime_UTC)
        
        // Si le match a un gagnant, il est terminé
        if (match.winner) {
            return 'finished'
        }
        
        // Si le match a des games avec des gagnants mais pas de gagnant final, il est en cours
        if (match.MatchScheduleGame && match.MatchScheduleGame.some(g => g.winner)) {
            return 'live'
        }
        
        // Si l'heure du match est passée de plus de 4 heures, il est probablement terminé
        const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)
        if (matchDate < fourHoursAgo) {
            return 'finished'
        }
        
        // Si l'heure du match est passée mais moins de 4 heures, il pourrait être en cours
        if (matchDate < now) {
            return 'live'
        }
        
        // Sinon, le match n'a pas encore commencé
        return 'upcoming'
    }

    return (
        <div className="space-y-4">
            <ChoseDate 
                {...choseDateProps}
                minDate={tournamentInfo ? new Date(tournamentInfo.dateStart) : undefined}
                maxDate={tournamentInfo?.dateEnd ? new Date(tournamentInfo.dateEnd) : undefined}
            />
            
            <div className="space-y-3">
                {loading && matches.length === 0 ? (
                    <Card>
                        <CardBody>
                            <div className="text-center py-8">
                                <p className="text-gray-400">Chargement des matchs...</p>
                            </div>
                        </CardBody>
                    </Card>
                ) : error ? (
                    <Card>
                        <CardBody>
                            <div className="text-center py-8">
                                <p className="text-red-400">Erreur: {error}</p>
                            </div>
                        </CardBody>
                    </Card>
                ) : filteredMatches.length === 0 ? (
                    <Card>
                        <CardBody>
                            <div className="text-center py-8">
                                <p className="text-gray-400">
                                    {search 
                                        ? 'Aucun match trouvé pour cette recherche'
                                        : 'Aucun match prévu pour cette date'
                                    }
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    <>
                        {filteredMatches.map((match) => {
                            const status = getMatchStatus(match)
                            const showMatch = !isLive || status === 'live'
                            
                            // Debug log pour les matchs live
                            if (isLive && status === 'live') {
                                console.log('Live match found:', match.team1, 'vs', match.team2, 'at', match.dateTime_UTC)
                            }
                            
                            if (!showMatch) return null
                            
                            return (
                                <Card key={match.matchId} className={matchChaud ? 'border-orange-500' : ''}>
                                    <CardBody>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-sm text-gray-400">
                                                    {formatTime(match.dateTime_UTC)}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{match.team1}</span>
                                                    <span className="text-gray-400">vs</span>
                                                    <span className="font-medium">{match.team2}</span>
                                                </div>
                                            </div>
                                            <div>
                                                {status === 'finished' && (
                                                    <span className="text-sm text-gray-400">
                                                        {match.team1Score || 0} - {match.team2Score || 0}
                                                    </span>
                                                )}
                                                {status === 'live' && (
                                                    <span className="text-sm text-red-500 font-medium">LIVE</span>
                                                )}
                                                {status === 'upcoming' && (
                                                    <span className="text-sm text-gray-400">À venir</span>
                                                )}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            )
                        })}
                        
                        {pagination.hasMore && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Chargement...' : 'Charger plus'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}