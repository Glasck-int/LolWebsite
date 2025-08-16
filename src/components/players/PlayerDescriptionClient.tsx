'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PlayerWithRedirects } from '@glasck-int/glasck-types'

interface PlayerDescriptionClientProps {
    playerData: PlayerWithRedirects
    playerImage?: string
    teamImage?: string
    teamName?: string
}

export const PlayerDescriptionClient = ({
    playerData,
    playerImage,
    teamImage,
    teamName,
}: PlayerDescriptionClientProps) => {
    return (
        <>
            <div className="w-[125px] h-[125px] flex items-center justify-center flex-shrink-0">
                <Image
                    src={playerImage!}
                    alt={playerData.name || ''}
                    width={125}
                    height={125}
                    className="object-contain drop-shadow-lg rounded-lg max-w-[125px] max-h-[125px]"
                />
            </div>
            <div className="flex flex-col justify-center items-start gap-0 min-w-0 flex-1">
                <h1 className="font-medium m-0 leading-none truncate w-full">
                    {playerData.playerId}
                </h1>
                {teamName ? (
                    <Link 
                        href={`/teams/${encodeURIComponent(teamName)}`}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        {teamImage && (
                            <Image
                                src={teamImage}
                                alt={teamName}
                                width={30}
                                height={30}
                                className="object-contain max-w-[30px] max-h-[30px]"
                            />
                        )}
                        <p className="text-clear-grey font-semibold m-0 leading-none truncate">
                            {teamName}
                        </p>
                    </Link>
                ) : (
                    <p className="text-clear-grey font-semibold m-0 leading-none">
                        No Team
                    </p>
                )}
            </div>
        </>
    )
}