import React from 'react'
import { LeagueGrid } from './LeagueGrid'
import { League } from '@/generated/prisma'

interface LeagueSectionProps {
    title?: string[]
    leagues: League[]
    images?: (string | undefined)[]
    square?: boolean
    className?: string
}

/**
 * League section component
 *
 * Displays a section with title and league grid
 *
 * @param title - Array of title parts to display on separate lines
 * @param leagues - Array of leagues to display
 * @param images - Optional array of image URLs
 * @param square - Whether to display images in a square format
 * @param className - Additional CSS classes
 * @returns A complete section with title and league grid
 */
export const LeagueSection: React.FC<LeagueSectionProps> = ({
    title,
    leagues,
    images,
    square = false,
    className = '',
}) => {
    return (
        <div className={`mb-8 ${className}`}>
            <div className="flex flex-col">
                {title && title.map((titlePart, index) => (
                    <h1
                        key={index}
                        className={`text-7xl ${
                            index === title.length - 1 ? 'mb-4' : ''
                        }`}
                    >
                        {titlePart}
                    </h1>
            ))}
            </div>
            
            <LeagueGrid
                leagues={leagues}
                images={images}
                square={square}
            />
        </div>
    )
}
