'use client'

import React from 'react'
import { useNextMatchesSWR } from '@/hooks/useNextMatchesSWR'
import { NextMatchesClient } from './NextMatchesClient'
import { MatchSkeleton } from '@/components/ui/skeleton/MatchSkeleton'
import {
    Card,
    CardBody,
    CardHeader,
    CardHeaderBase,
} from '@/components/ui/card/index'

/**
 * Props for the NextMatchesFetch component
 */
interface NextMatchesFetchProps {
    tournamentId: number
    showSingleMatchOnDesktop?: boolean
}

/**
 * Next matches fetch component with SWR caching system
 * 
 * @description
 * This component fetches tournament matches data using SWR for caching,
 * enriches it with team data and images, then passes it to the client component.
 * 
 * Features:
 * - Automatic client-side data caching
 * - Automatic deduplication of concurrent requests
 * - Optimized loading and error state handling
 * - Smart data revalidation
 * - Automatic fallback from next to last matches
 * 
 * @param {NextMatchesFetchProps} props - Component properties
 * @param {number} props.tournamentId - Tournament ID to fetch matches for
 * @param {boolean} [props.showSingleMatchOnDesktop=false] - Whether to show only one match on desktop
 * 
 * @returns {JSX.Element} Rendered component with either loading, error, or matches data
 */
export const NextMatchesFetch = ({
    tournamentId,
    showSingleMatchOnDesktop = false
}: NextMatchesFetchProps) => {
    const { data, loading, error } = useNextMatchesSWR(tournamentId)

    if (loading) {
        return (
            <div className="w-full">
                <MatchSkeleton />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[125px]">
                <div className="text-red-400">
                    Error loading matches: {error}
                </div>
            </div>
        )
    }

    if (!data || !data.matches.length) {
        return (
            <div className="flex items-center justify-center h-[125px]">
                <div className="text-gray-400">Aucun match disponible</div>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardHeaderBase>
                    <div className="flex flex-row justify-between items-center w-full">
                        <NextMatchesClient
                            initialData={data}
                        //     tournamentId={tournamentId}
                            showSingleMatchOnDesktop={showSingleMatchOnDesktop}
                            isHeader={true}
                            bestOf={data.matches[0]?.bestOf}
                        />
                    </div>
                </CardHeaderBase>
            </CardHeader>
            <CardBody>
                <NextMatchesClient
                    initialData={data}
                //     tournamentId={tournamentId}
                    showSingleMatchOnDesktop={showSingleMatchOnDesktop}
                    isHeader={false}
                />
            </CardBody>
        </Card>
    )
}