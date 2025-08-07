'use client'

import React, { useEffect, useState, useCallback } from 'react'
import ChoseDate, { useChoseDate } from '@/components/ui/calendar/ChoseDate'
import { Card, CardBody } from '@/components/ui/card'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { TimeDisplay } from '@/lib/hooks/timeDisplay'
import { MatchSchedule } from '@/generated/prisma'

/**
 * Props for the MatchesCalendar component
 * @interface MatchesCalendarProps
 */
interface MatchesCalendarProps {
    /** The unique identifier of the tournament to display matches for */
    tournamentId: string
}

/**
 * Tournament information structure
 * @interface TournamentInfo
 */
interface TournamentInfo {
    /** Tournament ID */
    id: number
    /** Tournament start date in ISO format */
    dateStart: string
    /** Tournament end date in ISO format (nullable for ongoing tournaments) */
    dateEnd: string | null
}

/**
 * Extended match type that includes game information
 * @typedef {MatchSchedule} MatchWithGames
 */
type MatchWithGames = MatchSchedule & {
    /** Array of games within this match */
    MatchScheduleGame?: Array<{
        /** Game ID */
        id: number
        /** External game identifier */
        gameId: string | null
        /** Game number within the match (1, 2, 3, etc.) */
        nGameInMatch: number
        /** Winner team number (1 or 2) */
        winner: number | null
        /** Blue side team name */
        blue: string | null
        /** Red side team name */
        red: string | null
    }>
}

/**
 * API response structure for matches
 * @interface MatchesResponse
 */
interface MatchesResponse {
    /** Array of match data */
    data: MatchWithGames[]
    /** Pagination information */
    pagination: {
        /** Total number of matches */
        total: number
        /** Number of matches per page */
        limit: number
        /** Current offset for pagination */
        offset: number
        /** Whether more matches are available */
        hasMore: boolean
    }
}

/**
 * MatchesCalendar Component
 * 
 * A comprehensive calendar view for tournament matches with intelligent navigation
 * and filtering capabilities.
 * 
 * @component
 * @param {MatchesCalendarProps} props - Component props
 * @param {string} props.tournamentId - The tournament ID to display matches for
 * 
 * @example
 * ```tsx
 * <MatchesCalendar tournamentId="123" />
 * ```
 * 
 * @features
 * - Smart date navigation (only navigates to dates with matches)
 * - Live match filtering
 * - Hot match highlighting
 * - Team search functionality
 * - Pagination support for large match lists
 * - Real-time match status detection (upcoming/live/finished)
 * - Responsive design with loading and error states
 * 
 * @remarks
 * This component fetches match data from the backend API and provides an intuitive
 * interface for browsing tournament matches. It automatically initializes to the
 * closest date with matches (today or next available) and prevents navigation to
 * empty dates.
 * 
 * The component uses the following API endpoints:
 * - `/tournaments/id/:tournamentId` - Tournament information
 * - `/tournaments/id/:tournamentId/match-dates` - Available match dates
 * - `/tournaments/id/:tournamentId/matches/by-date` - Matches for specific date
 * 
 * @since 1.0.0
 */
export const MatchesCalendar: React.FC<MatchesCalendarProps> = ({ tournamentId }) => {
    const choseDateProps = useChoseDate()
    const { selectedDate, isLive, matchChaud, search } = choseDateProps
    const [matches, setMatches] = useState<MatchWithGames[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [tournamentInfo, setTournamentInfo] = useState<TournamentInfo | null>(null)
    const [availableDates, setAvailableDates] = useState<string[]>([])
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
    })
    const t = useTranslate('Matches')

    // Fetch tournament info and available dates
    useEffect(() => {
        const fetchTournamentData = async () => {
            try {
                // Fetch tournament info
                const tournamentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/id/${tournamentId}`)
                if (tournamentResponse.ok) {
                    const data = await tournamentResponse.json()
                    if (data && data.length > 0) {
                        setTournamentInfo(data[0])
                    }
                }

                // Fetch available match dates
                const datesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/id/${tournamentId}/match-dates`)
                if (datesResponse.ok) {
                    const datesData = await datesResponse.json()
                    setAvailableDates(datesData.dates || [])
                    
                    // Set initial date to the closest date with matches
                    if (datesData.dates && datesData.dates.length > 0) {
                        const today = new Date()
                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                        
                        // Find the closest date (today or next available)
                        let targetDate = datesData.dates.find((date: string) => date >= todayStr)
                        if (!targetDate) {
                            // If no future dates, use the last date
                            targetDate = datesData.dates[datesData.dates.length - 1]
                        }
                        
                        choseDateProps.setSelectedDate(new Date(targetDate + 'T12:00:00'))
                    }
                }
            } catch (err) {
                console.error('Error fetching tournament data:', err)
            }
        }

        if (tournamentId) {
            fetchTournamentData()
        }
    }, [tournamentId])

    /**
     * Fetches matches for a specific date with pagination support
     * 
     * @param {Date} date - The date to fetch matches for
     * @param {number} [offset=0] - Pagination offset for loading more matches
     * @returns {Promise<void>} Updates component state with fetched matches
     * 
     * @async
     * @private
     */
    const fetchMatches = useCallback(async (date: Date, offset = 0) => {
        if (!tournamentId) return

        setLoading(true)
        setError(null)

        try {
            // Format date to YYYY-MM-DD for the API
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            
            // Use the by-date endpoint with proper pagination
            const limit = 50
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/id/${tournamentId}/matches/by-date?date=${dateStr}&limit=${limit}&offset=${offset}`
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
            
            if (offset === 0) {
                setMatches(data.data || [])
            } else {
                setMatches(prev => [...prev, ...(data.data || [])])
            }
            
            setPagination(data.pagination || {
                total: 0,
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

    /**
     * Loads more matches for the current date (pagination)
     * 
     * @returns {void}
     * @private
     */
    const loadMore = () => {
        if (!pagination.hasMore || loading) return
        fetchMatches(selectedDate, pagination.offset + pagination.limit)
    }

    /**
     * Navigates to the next or previous date that has matches
     * 
     * @param {'next' | 'prev'} direction - Direction to navigate
     * @returns {string | null} The target date in YYYY-MM-DD format, or null if no date available
     * 
     * @remarks
     * This function ensures users never land on dates without matches.
     * It does not wrap around - stops at first/last available date.
     * 
     * @private
     */
    const navigateToDateWithMatches = useCallback((direction: 'next' | 'prev') => {
        if (availableDates.length === 0) return null

        const currentDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
        const currentIndex = availableDates.findIndex(date => date === currentDateStr)
        
        let targetIndex: number | undefined
        if (currentIndex === -1) {
            // Current date doesn't have matches, find the nearest date
            if (direction === 'next') {
                targetIndex = availableDates.findIndex(date => date > currentDateStr)
                if (targetIndex === -1) return null // No more dates available
            } else {
                // Find last date before current
                for (let i = availableDates.length - 1; i >= 0; i--) {
                    if (availableDates[i] < currentDateStr) {
                        targetIndex = i
                        break
                    }
                }
                if (targetIndex === undefined) return null // No more dates available
            }
        } else {
            // Navigate from current position
            if (direction === 'next') {
                if (currentIndex >= availableDates.length - 1) {
                    return null // Already at last date
                }
                targetIndex = currentIndex + 1
            } else {
                if (currentIndex <= 0) {
                    return null // Already at first date
                }
                targetIndex = currentIndex - 1
            }
        }

        const targetDate = availableDates[targetIndex]
        if (targetDate) {
            choseDateProps.setSelectedDate(new Date(targetDate + 'T12:00:00'))
            return targetDate
        }
        return null
    }, [availableDates, selectedDate, choseDateProps])
    
    /**
     * Checks if navigation to the next date with matches is possible
     * 
     * @returns {boolean} True if there are future dates with matches
     * 
     * @private
     */
    const canNavigateNext = useCallback(() => {
        if (availableDates.length === 0) return false
        const currentDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
        const currentIndex = availableDates.findIndex(date => date === currentDateStr)
        
        if (currentIndex === -1) {
            // Current date doesn't have matches, check if there are dates after current
            return availableDates.some(date => date > currentDateStr)
        }
        // Check if we're not at the last date
        return currentIndex < availableDates.length - 1
    }, [availableDates, selectedDate])
    
    /**
     * Checks if navigation to the previous date with matches is possible
     * 
     * @returns {boolean} True if there are past dates with matches
     * 
     * @private
     */
    const canNavigatePrev = useCallback(() => {
        if (availableDates.length === 0) return false
        const currentDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
        const currentIndex = availableDates.findIndex(date => date === currentDateStr)
        
        if (currentIndex === -1) {
            // Current date doesn't have matches, check if there are dates before current
            return availableDates.some(date => date < currentDateStr)
        }
        // Check if we're not at the first date
        return currentIndex > 0
    }, [availableDates, selectedDate])

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

    /**
     * Determines the current status of a match based on its data
     * 
     * @param {MatchWithGames} match - The match object to analyze
     * @returns {'upcoming' | 'live' | 'finished'} The current match status
     * 
     * @remarks
     * Status determination logic:
     * - 'finished': Has a winner OR all games completed OR >6 hours past start time
     * - 'live': Has scores but no winner OR has some completed games OR <6 hours past start
     * - 'upcoming': Future start time
     * 
     * @private
     */
    const getMatchStatus = (match: MatchWithGames) => {
        const now = new Date()
        const matchDate = new Date(match.dateTime_UTC)
        
        // Si le match a un gagnant défini, il est terminé
        if (match.winner !== null && match.winner !== undefined) {
            return 'finished'
        }
        
        // Si le match a des scores définis (team1Score ou team2Score), il est soit en cours soit terminé
        if ((match.team1Score !== null && match.team1Score !== undefined) || 
            (match.team2Score !== null && match.team2Score !== undefined)) {
            // Si les scores sont définis mais pas de gagnant, c'est probablement en cours
            if (match.winner === null || match.winner === undefined) {
                // Vérifier si le match a des games en cours
                if (match.MatchScheduleGame && match.MatchScheduleGame.length > 0) {
                    const hasCompletedGames = match.MatchScheduleGame.some(g => g.winner !== null)
                    const hasAllGamesCompleted = match.MatchScheduleGame.every(g => g.winner !== null)
                    
                    if (hasCompletedGames && !hasAllGamesCompleted) {
                        return 'live'
                    }
                    if (hasAllGamesCompleted) {
                        return 'finished'
                    }
                }
                return 'live'
            }
            return 'finished'
        }
        
        // Si le match a des games avec des gagnants mais pas de score/gagnant final, il est en cours
        if (match.MatchScheduleGame && match.MatchScheduleGame.some(g => g.winner !== null)) {
            return 'live'
        }
        
        // Si l'heure du match est dans le futur, il n'a pas encore commencé
        if (matchDate > now) {
            return 'upcoming'
        }
        
        // Si l'heure du match est passée de plus de 6 heures, il est probablement terminé
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000)
        if (matchDate < sixHoursAgo) {
            return 'finished'
        }
        
        // Si l'heure du match est passée mais moins de 6 heures, il pourrait être en cours
        // Ceci est une estimation car nous n'avons pas de statut exact
        return 'live'
    }

    return (
        <div className="space-y-4">
            <ChoseDate 
                {...choseDateProps}
                minDate={tournamentInfo ? new Date(tournamentInfo.dateStart) : undefined}
                maxDate={tournamentInfo?.dateEnd ? new Date(tournamentInfo.dateEnd) : undefined}
                onNavigateNext={() => navigateToDateWithMatches('next')}
                onNavigatePrev={() => navigateToDateWithMatches('prev')}
                canNavigateNext={canNavigateNext()}
                canNavigatePrev={canNavigatePrev()}
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
                            <div className="text-center items-center py-8">
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
                                                <TimeDisplay dateTime_UTC={new Date(match.dateTime_UTC)} />
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