import React from 'react'
import { League } from '@/generated/prisma'
import { LeagueCardServer } from './LeagueCardServer'

interface LeagueGridProps {
    leagues: League[]
    images?: (string | undefined)[]
    square?: boolean
    className?: string
}

/**
 * League grid component
 *
 * Displays a grid of league cards
 *
 * @param leagues - Array of leagues to display
 * @param images - Optional array of image URLs corresponding to leagues
 * @param square - Whether to display images in a square format
 * @param className - Additional CSS classes for the grid
 * @returns A grid of league cards
 */
export const LeagueGrid: React.FC<LeagueGridProps> = ({
    leagues,
    images = [],
    square = false,
    className = '',
}) => {
    const gridCols = square
        ? 'grid-cols-3 sm:grid-cols-4'
        : 'grid-cols-1'
    const gap = square ? 'gap-4' : 'gap-2'

    const maxResults = 20
    const emptyCardsNeeded = Math.max(0, maxResults - leagues.length)

    return (
        <div className={`grid ${gridCols} ${gap} ${className} `}>
            {leagues.map((league, index) => (
                <LeagueCardServer
                    key={league.id}
                    league={league}
                    imageUrl={images[index]}
                    square={square}
                />
            ))}

            {!square &&
                Array.from({ length: emptyCardsNeeded }, (_, index) => (
                    <div
                        key={`empty-${index}`}
                        className="h-10 opacity-0 pointer-events-none "
                    >
                        {/* Invisible placeholder card */}
                    </div>
                ))}
        </div>
    )
}
