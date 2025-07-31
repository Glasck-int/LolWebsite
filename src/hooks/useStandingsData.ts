'use client'

import { useEffect, useState } from 'react'
import { Standings } from '@/generated/prisma'
import { getTournamentStandingsByTournamentId } from '@/lib/api/tournaments'
import { fetchEnrichedStandingsData, fetchEnrichedStandingsOverviewData } from '@/lib/api/standings'
import { ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'
import { useTableEntityStore } from '@/store/tableEntityStore'

interface UseStandingsDataResult {
    standings: Standings[] | null
    processedData: ProcessedStanding[] | null
    loading: boolean
    error: string | null
}

export const useStandingsData = (tournamentId: number | null): UseStandingsDataResult => {
    const [standings, setStandings] = useState<Standings[] | null>(null)
    const [processedData, setProcessedData] = useState<ProcessedStanding[] | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { 
        getCachedStandingsOverview, 
        setCachedStandingsOverview, 
        setStandingsOverviewLoading, 
        setStandingsOverviewError 
    } = useTableEntityStore()

    useEffect(() => {
        if (!tournamentId) {
            setStandings(null)
            setProcessedData(null)
            setError(null)
            return
        }

        // Check cache first
        const cached = getCachedStandingsOverview(tournamentId)
        if (cached?.data && !cached.loading && !cached.error) {
            setStandings(cached.data.standings)
            setProcessedData(cached.data.processedData)
            setLoading(false)
            setError(null)
            return
        }

        // If loading from cache, show loading state
        if (cached?.loading) {
            setLoading(true)
            setError(null)
            return
        }

        // If error from cache, show error
        if (cached?.error) {
            setError(cached.error)
            setLoading(false)
            return
        }

        const fetchStandings = async () => {
            setLoading(true)
            setError(null)
            setStandingsOverviewLoading(tournamentId, true)

            try {
                // Get standings first
                const standingsResponse = await getTournamentStandingsByTournamentId(tournamentId.toString())
                
                if (!standingsResponse.data || standingsResponse.data.length === 0) {
                    const emptyData = {
                        standings: [],
                        processedData: [],
                        tournamentName: ''
                    }
                    setCachedStandingsOverview(tournamentId, emptyData)
                    setStandings([])
                    setProcessedData([])
                    setStandingsOverviewLoading(tournamentId, false)
                    return
                }

                // For processed data, we need the tournament name
                // We'll use the first standing's overviewPage as tournament name
                const tournamentName = standingsResponse.data[0]?.overviewPage || ''
                
                let enrichedData: ProcessedStanding[] = []
                if (tournamentName) {
                    // Fetch enriched data for overview
                    enrichedData = await fetchEnrichedStandingsOverviewData(
                        standingsResponse.data,
                        tournamentName
                    )
                }


                // Cache the data
                const dataToCache = {
                    standings: standingsResponse.data,
                    processedData: enrichedData,
                    tournamentName
                }
                setCachedStandingsOverview(tournamentId, dataToCache)

                setStandings(standingsResponse.data)
                setProcessedData(enrichedData)
                setStandingsOverviewLoading(tournamentId, false)
            } catch (err) {
                console.error('Error fetching standings data:', err)
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch standings data'
                setError(errorMessage)
                setStandingsOverviewError(tournamentId, errorMessage)
                setStandings(null)
                setProcessedData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchStandings()
    }, [tournamentId, getCachedStandingsOverview, setCachedStandingsOverview, setStandingsOverviewLoading, setStandingsOverviewError])

    return {
        standings,
        processedData,
        loading,
        error
    }
}

interface UseStandingsWithTabsDataResult {
    standings: Standings[] | null
    processedData: ProcessedStanding[] | null
    loading: boolean
    error: string | null
}

export const useStandingsWithTabsData = (tournamentId: number | null): UseStandingsWithTabsDataResult => {
    const [standings, setStandings] = useState<Standings[] | null>(null)
    const [processedData, setProcessedData] = useState<ProcessedStanding[] | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { 
        getCachedStandingsWithTabs, 
        setCachedStandingsWithTabs, 
        setStandingsWithTabsLoading, 
        setStandingsWithTabsError 
    } = useTableEntityStore()

    useEffect(() => {
        if (!tournamentId) {
            setStandings(null)
            setProcessedData(null)
            setError(null)
            return
        }

        // Check cache first
        const cached = getCachedStandingsWithTabs(tournamentId)
        if (cached?.data && !cached.loading && !cached.error) {
            setStandings(cached.data.standings)
            setProcessedData(cached.data.processedData)
            setLoading(false)
            setError(null)
            return
        }

        // If loading from cache, show loading state
        if (cached?.loading) {
            setLoading(true)
            setError(null)
            return
        }

        // If error from cache, show error
        if (cached?.error) {
            setError(cached.error)
            setLoading(false)
            return
        }

        const fetchStandings = async () => {
            setLoading(true)
            setError(null)
            setStandingsWithTabsLoading(tournamentId, true)

            try {
                // Get standings first
                const standingsResponse = await getTournamentStandingsByTournamentId(tournamentId.toString())
                
                if (!standingsResponse.data || standingsResponse.data.length === 0) {
                    const emptyData = {
                        standings: [],
                        processedData: [],
                        tournamentName: ''
                    }
                    setCachedStandingsWithTabs(tournamentId, emptyData)
                    setStandings([])
                    setProcessedData([])
                    setStandingsWithTabsLoading(tournamentId, false)
                    return
                }

                // For processed data, we need the tournament name
                // We'll use the first standing's overviewPage as tournament name
                const tournamentName = standingsResponse.data[0]?.overviewPage || ''
                
                let enrichedData: ProcessedStanding[] = []
                if (tournamentName) {
                    // Fetch enriched data for tabs (includes games data)
                    const enrichedDataResponse = await fetchEnrichedStandingsData(
                        standingsResponse.data,
                        tournamentName
                    )
                    enrichedData = enrichedDataResponse.processedData
                }


                // Cache the data
                const dataToCache = {
                    standings: standingsResponse.data,
                    processedData: enrichedData,
                    tournamentName
                }
                setCachedStandingsWithTabs(tournamentId, dataToCache)

                setStandings(standingsResponse.data)
                setProcessedData(enrichedData)
                setStandingsWithTabsLoading(tournamentId, false)
            } catch (err) {
                console.error('Error fetching standings with tabs data:', err)
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch standings data'
                setError(errorMessage)
                setStandingsWithTabsError(tournamentId, errorMessage)
                setStandings(null)
                setProcessedData(null)
            } finally {
                setLoading(false)
            }
        }

        fetchStandings()
    }, [tournamentId, getCachedStandingsWithTabs, setCachedStandingsWithTabs, setStandingsWithTabsLoading, setStandingsWithTabsError])

    return {
        standings,
        processedData,
        loading,
        error
    }
}