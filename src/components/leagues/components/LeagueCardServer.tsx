import React from 'react'
import { League as LeagueType } from '@/generated/prisma'
import { getLeagueImage } from '@/lib/api/image'
import { LeagueCardClient } from './LeagueCardClient'

interface LeagueCardServerProps {
    league: LeagueType
    imageUrl?: string
    square?: boolean
    className?: string
}

/**
 * Server component wrapper for LeagueCard that pre-loads images for SEO
 */
export const LeagueCardServer: React.FC<LeagueCardServerProps> = async ({
    league,
    imageUrl,
    square = false,
    className = '',
}) => {
    // Pre-load league image on server for SEO
    const leagueImageResponse = await getLeagueImage(league.name)
    const preloadedImageUrl = leagueImageResponse.data || undefined

    return (
        <LeagueCardClient
            league={league}
            imageUrl={imageUrl}
            preloadedImageUrl={preloadedImageUrl}
            square={square}
            className={className}
        />
    )
}