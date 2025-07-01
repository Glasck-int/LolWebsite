'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card/Card'
import { League as LeagueType } from '../../../backend/src/generated/prisma'
import { createLeagueSlug } from '@/lib/utils'

interface LeagueCardProps {
    league: LeagueType
    imageUrl?: string
    square?: boolean
    className?: string
}

/**
 * League card component
 *
 * Displays a single league with optional image in a card format
 *
 * @param league - The league data to display
 * @param imageUrl - Optional image URL for the league
 * @param square - Whether to display the image in a square format
 * @param className - Additional CSS classes
 * @returns A card component displaying league information
 */
export const LeagueCard: React.FC<LeagueCardProps> = ({
    league,
    imageUrl,
    square = false,
    className = '',
}) => {
    const [imageError, setImageError] = useState(false)

    // Debug: Display image URL
    useEffect(() => {
        if (imageUrl) {
            console.log(`Loading image for ${league.name}:`, imageUrl)
        }
    }, [imageUrl, league.name])

    // Check if image URL is valid
    const isValidImageUrl = imageUrl && imageUrl.trim() !== ''

    const renderImageOrFallback = () => {
        if (isValidImageUrl && !imageError) {
            return (
                <Image
                    src={imageUrl}
                    alt={league.name}
                    fill
                    className="object-contain"
                    onError={(e) => {
                        console.error(
                            `Image failed to load for ${league.name}:`,
                            imageUrl
                        )
                        setImageError(true)
                    }}
                    onLoad={() => {
                        console.log(
                            `Image loaded successfully for ${league.name}`
                        )
                    }}
                    priority={false}
                />
            )
        }

        // Fallback: League initials
        return (
            <div
                className={`w-full h-full flex items-center justify-center bg-white/10 rounded-lg ${
                    square ? 'text-2xl' : 'text-xs'
                }`}
            >
                <span className="font-bold text-white">
                    {league.short.slice(0, 2).toUpperCase()}
                </span>
            </div>
        )
    }

    const slug = createLeagueSlug(league.name)


    if (square) {
        return (
            <Link href={`/leagues/${slug}`}>
                <div
                    className={`w-full aspect-square cursor-pointer ${className}`}
                >
                    <Card className="backdrop-blur p-2 md:p-4 shadow-md h-full items-center justify-center gap-y-3 cursor-pointer hover:bg-white/10 hover:scale-102 active:scale-95 active:bg-white/5 transition-all duration-200">
                        <div className="w-[50%] h-[50%] relative">
                            {renderImageOrFallback()}
                        </div>
                        <h3 className="text-[clamp(0.7rem,3vw,1.2rem)] font-medium text-center text-clear-grey">
                            {league.short}
                        </h3>
                    </Card>
                </div>
            </Link>
        )
    }

    return (
        <Link href={`/leagues/${slug}`}>
            <div className={`w-full h-10 cursor-pointer ${className}`}>
                <Card className=" backdrop-blur p-5 shadow-md h-full flex flex-row items-center justify-start cursor-pointer hover:bg-white/10 active:bg-white/5 transition-all duration-200">
                    
                    <h3 className="text-sm md:text-base font-medium text-left text-white">
                        {league.name}
                    </h3>
                </Card>
            </div>
        </Link>
    )
}
