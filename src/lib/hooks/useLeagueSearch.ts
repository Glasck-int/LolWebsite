'use client'

import { useState, useMemo, useCallback } from 'react'
import { League as LeagueType } from '../../../backend/src/generated/prisma'

interface UseLeagueSearchProps {
    leagues: LeagueType[]
    maxResults?: number
}

interface SearchResult {
    league: LeagueType
    score: number
    matchType: 'short' | 'name' | 'region'
}

/**
 * Custom hook for league search and filtering
 *
 * Provides strict search functionality with priority scoring and sequential character matching.
 * Prioritizes short name matches and requires characters to be sequential with max 2 character gap.
 *
 * @param leagues - Array of all leagues to search through
 * @param maxResults - Maximum number of results to display (default: 50)
 * @returns Object with search state, filtered results, and control functions
 *
 * @example
 * ```ts
 * const { searchTerm, setSearchTerm, filteredLeagues, totalResults, onlyOfficial, setOnlyOfficial } = useLeagueSearch(allLeagues, 30)
 * ```
 */
export const useLeagueSearch = ({
    leagues,
    maxResults = 50,
}: UseLeagueSearchProps) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [onlyOfficial, setOnlyOfficial] = useState(true) // Default to only official leagues

    /**
     * Checks if search term characters appear sequentially in target string
     * with maximum 2 character gap between consecutive matches
     */
    const isSequentialMatch = useCallback(
        (searchTerm: string, target: string): boolean => {
            if (!searchTerm || !target) return false

            const searchChars = searchTerm.toLowerCase().split('')
            const targetChars = target.toLowerCase().split('')

            let searchIndex = 0
            let lastMatchIndex = -1

            for (
                let i = 0;
                i < targetChars.length && searchIndex < searchChars.length;
                i++
            ) {
                if (targetChars[i] === searchChars[searchIndex]) {
                    // Check if gap is too large (more than 2 characters)
                    if (lastMatchIndex !== -1 && i - lastMatchIndex > 4) {
                        return false
                    }
                    lastMatchIndex = i
                    searchIndex++
                }
            }

            return searchIndex === searchChars.length
        },
        []
    )

    /**
     * Calculates search score based on match type and quality
     */
    const calculateScore = useCallback(
        (league: LeagueType, searchTerm: string): SearchResult | null => {
            const normalizedSearch = searchTerm.toLowerCase().trim()

            if (!normalizedSearch) return null

            // Check for exact word boundaries (spaces before/after)
            const hasWordBoundaries = searchTerm !== normalizedSearch

            // Check short name first (highest priority)
            if (isSequentialMatch(normalizedSearch, league.short)) {
                let score = 100

                // Highest priority: exact match on short name
                if (league.short.toLowerCase() === normalizedSearch) {
                    score = 200
                }
                // Second priority: starts with
                else if (
                    league.short.toLowerCase().startsWith(normalizedSearch)
                ) {
                    score += 50
                }

                // Add bonus for word boundaries (but not for exact matches)
                if (
                    hasWordBoundaries &&
                    league.short.toLowerCase() !== normalizedSearch
                ) {
                    score += 75
                }

                return {
                    league,
                    score,
                    matchType: 'short',
                }
            }

            // Check name
            if (isSequentialMatch(normalizedSearch, league.name)) {
                let score = 50

                // Add bonus for word boundaries
                if (hasWordBoundaries) {
                    score += 75
                }

                // Add bonus for starts with
                if (league.name.toLowerCase().startsWith(normalizedSearch)) {
                    score += 25
                }

                return {
                    league,
                    score,
                    matchType: 'name',
                }
            }

            // Check region
            if (isSequentialMatch(normalizedSearch, league.region)) {
                let score = 25

                // Add bonus for word boundaries
                if (hasWordBoundaries) {
                    score += 75
                }

                // Add bonus for starts with
                if (league.region.toLowerCase().startsWith(normalizedSearch)) {
                    score += 10
                }

                return {
                    league,
                    score,
                    matchType: 'region',
                }
            }

            return null
        },
        [isSequentialMatch]
    )

    // Search function with useCallback optimization
    const searchLeagues = useCallback(
        (leaguesToSearch: LeagueType[], term: string) => {
            const normalizedSearch = term.toLowerCase().trim()

            if (!normalizedSearch) return leaguesToSearch

            const results: SearchResult[] = []

            leaguesToSearch.forEach((league) => {
                const result = calculateScore(league, normalizedSearch)
                if (result) {
                    results.push(result)
                }
            })

            // Sort by score (highest first) and return leagues
            return results
                .sort((a, b) => b.score - a.score)
                .map((result) => result.league)
        },
        [calculateScore]
    )

    // Filter official leagues function
    const filterOfficialLeagues = useCallback(
        (leaguesToFilter: LeagueType[]) => {
            if (onlyOfficial) {
                return leaguesToFilter.filter((league) => league.isOfficial)
            }
            return leaguesToFilter
        },
        [onlyOfficial]
    )

    // Filtered results with useMemo optimization
    const filteredLeagues = useMemo(() => {
        const searchResults = searchLeagues(leagues, searchTerm)
        const officialFiltered = filterOfficialLeagues(searchResults)
        return officialFiltered.slice(0, maxResults)
    }, [leagues, searchTerm, maxResults, searchLeagues, filterOfficialLeagues])

    // Total results without limit for info
    const totalResults = useMemo(() => {
        const searchResults = searchLeagues(leagues, searchTerm)
        const officialFiltered = filterOfficialLeagues(searchResults)
        return officialFiltered.length
    }, [leagues, searchTerm, searchLeagues, filterOfficialLeagues])

    return {
        searchTerm,
        setSearchTerm,
        filteredLeagues,
        totalResults,
        onlyOfficial,
        setOnlyOfficial,
    }
}
