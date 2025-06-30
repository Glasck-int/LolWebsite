'use client'

import { useState, useMemo, useCallback } from 'react'
import { League as LeagueType } from '../../../backend/src/generated/prisma'

interface UseLeagueSearchProps {
    leagues: LeagueType[]
    maxResults?: number
}

/**
 * Custom hook for league search and filtering
 *
 * Provides search functionality with result caching to avoid redundant searches
 * and limits the number of displayed results to prevent performance issues
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

    // Search function with useCallback optimization
    const searchLeagues = useCallback(
        (leaguesToSearch: LeagueType[], term: string) => {
            const normalizedSearch = term.toLowerCase().trim()

            if (!normalizedSearch) return leaguesToSearch

            return leaguesToSearch.filter((league) => {
                const nameMatch = league.name
                    .toLowerCase()
                    .includes(normalizedSearch)
                const shortMatch = league.short
                    .toLowerCase()
                    .includes(normalizedSearch)
                const regionMatch = league.region
                    .toLowerCase()
                    .includes(normalizedSearch)

                return nameMatch || shortMatch || regionMatch
            })
        },
        []
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
