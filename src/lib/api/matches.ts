import { MatchSchedule } from '@/generated/prisma'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface TournamentInfo {
    id: number
    dateStart: string
    dateEnd: string | null
}

export type MatchWithGames = MatchSchedule & {
    MatchScheduleGame?: Array<{
        id: number
        gameId: string | null
        nGameInMatch: number
        winner: number | null
        blue: string | null
        red: string | null
    }>
}

export interface MatchesByDateResponse {
    data: MatchWithGames[]
    pagination: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

export interface MatchDatesResponse {
    dates: string[]
}

/**
 * Fetches tournament information by ID
 */
export async function getTournamentInfo(tournamentId: string): Promise<TournamentInfo | null> {
    try {
        const response = await fetch(`${API_URL}/api/tournaments/id/${tournamentId}`)
        if (!response.ok) {
            console.error('Failed to fetch tournament info:', response.status)
            return null
        }
        const data = await response.json()
        return data && data.length > 0 ? data[0] : null
    } catch (error) {
        console.error('Error fetching tournament info:', error)
        return null
    }
}

/**
 * Fetches available match dates for a tournament
 */
export async function getTournamentMatchDates(tournamentId: string): Promise<string[]> {
    try {
        const response = await fetch(`${API_URL}/api/tournaments/id/${tournamentId}/match-dates`)
        if (!response.ok) {
            console.error('Failed to fetch match dates:', response.status)
            return []
        }
        const data: MatchDatesResponse = await response.json()
        return data.dates || []
    } catch (error) {
        console.error('Error fetching match dates:', error)
        return []
    }
}

/**
 * Fetches matches for a specific date with pagination
 */
export async function getMatchesByDate(
    tournamentId: string,
    date: Date,
    limit = 50,
    offset = 0
): Promise<MatchesByDateResponse> {
    try {
        // Format date to YYYY-MM-DD
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        const response = await fetch(
            `${API_URL}/api/tournaments/id/${tournamentId}/matches/by-date?date=${dateStr}&limit=${limit}&offset=${offset}`
        )

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        limit,
                        offset: 0,
                        hasMore: false
                    }
                }
            }
            throw new Error('Failed to fetch matches')
        }

        const data = await response.json()
        return {
            data: data.data || [],
            pagination: data.pagination || {
                total: 0,
                limit,
                offset: 0,
                hasMore: false
            }
        }
    } catch (error) {
        console.error('Error fetching matches by date:', error)
        return {
            data: [],
            pagination: {
                total: 0,
                limit,
                offset: 0,
                hasMore: false
            }
        }
    }
}