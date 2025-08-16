import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TeamWithLatestLeague } from '@/lib/types/team'
import { League as LeagueType } from '@/generated/prisma'

interface TeamDescriptionProps {
    teamData: TeamWithLatestLeague
    teamImage?: string
    leagueImage?: string
    leagueData?: LeagueType
}

export const TeamDescription = ({
    teamData,
    teamImage,
    leagueImage,
    leagueData,
}: TeamDescriptionProps) => {
    const currentLeagueData = teamData.latestLeague || leagueData
    
    return (
        <div className="flex flex-row gap-2 items-center justify-start">
            {teamImage ? (
                <>
                    <div className="w-[100px] h-[100px] flex items-center justify-center flex-shrink-0">
                        <Image
                            src={teamImage}
                            alt={teamData.name || ''}
                            width={100}
                            height={100}
                            className="object-contain drop-shadow-lg max-w-[100px] max-h-[100px]"
                        />
                    </div>
                    <div className="flex flex-col justify-center items-start gap-0 min-w-0 flex-1">
                        <h1 className="font-medium m-0 leading-none truncate w-full">
                            {teamData.name}
                        </h1>
                        {currentLeagueData ? (
                            <Link 
                                href={`/leagues/${encodeURIComponent(currentLeagueData.name)}`}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                {leagueImage && (
                                    <Image
                                        src={leagueImage}
                                        alt={currentLeagueData.name}
                                        width={30}
                                        height={30}
                                        className="object-contain max-w-[30px] max-h-[30px]"
                                    />
                                )}
                                <p className="text-clear-grey font-semibold m-0 leading-none truncate">
                                     {currentLeagueData.short || currentLeagueData.name}
                                </p>
                            </Link>
                        ) : (
                            <p className="text-clear-grey font-semibold m-0 leading-none">
                                No League
                            </p>
                        )}
                    </div>
                </>
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
                            {teamData.name}
                        </h1>
                        {currentLeagueData ? (
                            <Link 
                                href={`/leagues/${encodeURIComponent(currentLeagueData.name)}`}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                                {leagueImage && (
                                    <Image
                                        src={leagueImage}
                                        alt={currentLeagueData.name}
                                        width={20}
                                        height={20}
                                        className="object-contain max-w-[20px] max-h-[20px]"
                                    />
                                )}
                                <p className="text-clear-grey font-semibold m-0 leading-none truncate">
                                    {currentLeagueData.short && currentLeagueData.short !== currentLeagueData.name
                                        ? currentLeagueData.short
                                        : currentLeagueData.name
                                            ? (() => {
                                                const words = currentLeagueData.name.split(' ');
                                                if (words.length >= 2) {
                                                    return words.map(word => word[0]).join('').slice(0, 2).toUpperCase();
                                                } else {
                                                    return currentLeagueData.name.slice(0, 2).toUpperCase();
                                                }
                                            })()
                                            : 'League'
                                    }
                                </p>
                            </Link>
                        ) : (
                            <p className="text-clear-grey font-semibold m-0 leading-none">
                                No League
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}