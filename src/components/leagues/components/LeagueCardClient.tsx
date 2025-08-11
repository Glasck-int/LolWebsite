'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card/Card'
import { League as LeagueType } from '@/generated/prisma'

interface LeagueCardClientProps {
    league: LeagueType
    imageUrl?: string
    preloadedImageUrl?: string
    square?: boolean
    className?: string
}

/**
 * Client component for LeagueCard - handles only client-side interactions
 */
export const LeagueCardClient = ({
    league,
    imageUrl,
    preloadedImageUrl,
    square = false,
    className = '',
}: LeagueCardClientProps) => {
    const [imageError, setImageError] = useState(false)

    // Use provided imageUrl first, then preloaded, then fallback
    const finalImageUrl = imageUrl || preloadedImageUrl
    const isValidImageUrl = finalImageUrl && finalImageUrl.trim() !== ''

    const renderImageOrFallback = () => {
        if (isValidImageUrl && !imageError) {
            return (
                <Image
                    src={finalImageUrl}
                    alt={league.name}
                    fill
                    className="object-contain"
                    onError={() => {
                        console.error(
                            `Image failed to load for ${league.name}:`,
                            finalImageUrl
                        )
                        setImageError(true)
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

    if (square) {
        return (
            <Link href={`/leagues/${league.name}`}>
                <div
                    className={`w-full aspect-square cursor-pointer ${className}`}
                >
                    <Card className="backdrop-blur p-2 md:p-4 shadow-md h-full items-center justify-center gap-y-3 cursor-pointer hover:bg-white/10 hover:scale-102 active:scale-95 active:bg-white/5 transition-all duration-200">
                        <div className="w-[50%] h-[50%] relative flex items-center justify-center p-2">
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

    const encodedName = encodeURIComponent(league.name)

    return (
        <Link href={`/leagues/${encodedName}`}>
            <div className={`w-full h-10 cursor-pointer ${className}`}>
                <Card className=" backdrop-blur p-5 shadow-md h-full flex flex-row items-center justify-start cursor-pointer hover:bg-white/10 active:bg-white/5 transition-all duration-200">
                    {preloadedImageUrl && (
                        <Image
                            src={preloadedImageUrl}
                            alt={league.name}
                            width={20}
                            height={20}
                            className="mr-2"
                            style={{ width: 'auto', height: 'auto' }}
                        />
                    )}
                    <h3 className="text-sm md:text-base font-medium text-left text-white">
                        {league.name}{' '}
                        <span className="text-clear-grey text-xs">
                            {league.short}
                        </span>
                    </h3>
                </Card>
            </div>
        </Link>
    )
}