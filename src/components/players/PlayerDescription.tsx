import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PlayerWithRedirects } from '@glasck-int/glasck-types'
import { PlayerDescriptionClient } from './PlayerDescriptionClient'

interface PlayerDescriptionProps {
    playerData: PlayerWithRedirects
    playerImage?: string
    teamImage?: string
    teamName?: string
}

export const PlayerDescription = ({
    playerData,
    playerImage,
    teamImage,
    teamName,
}: PlayerDescriptionProps) => {
    return (
        <div className="flex flex-row gap-2 items-center justify-start">
            {playerImage ? (
                <PlayerDescriptionClient
                    playerData={playerData}
                    playerImage={playerImage}
                    teamImage={teamImage}
                    teamName={teamName}
                />
            ) : (
                <>
                    <div className="w-[75px] h-[75px] rounded-lg bg-gradient-to-br from-dark-grey to-clear-violet/30 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-white"
                        >
                            <path
                                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                fill="currentColor"
                                opacity="0.9"
                            />
                        </svg>
                    </div>
                    <div className="flex flex-col justify-center items-start gap-0 min-w-0 flex-1">
                        <h1 className="font-medium m-0 leading-none truncate w-full">
                            {playerData.playerId }
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
                                        width={20}
                                        height={20}
                                        className="object-contain"
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
            )}
           
        </div>
    )
}