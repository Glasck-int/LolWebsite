import React from 'react'
import { League as LeagueType } from '@/generated/prisma'
import { LeagueCardClient } from './LeagueCardClient'

interface LeagueCardServerProps {
    league: LeagueType
    imageUrl?: string
    square?: boolean
    className?: string
}

/**
 * Wrapper for LeagueCard that can be used in both server and client contexts
 */
export const LeagueCardServer: React.FC<LeagueCardServerProps> = ({
    league,
    imageUrl,
    square = false,
    className = '',
}) => {
    return (
        <LeagueCardClient
            league={league}
            imageUrl={imageUrl}
            preloadedImageUrl={imageUrl}
            square={square}
            className={className}
        />
    )
}