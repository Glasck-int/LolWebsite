import React from 'react'
import { Tooltip } from '../../utils/Tooltip'
import { League as LeagueType } from '@/generated/prisma'
import { truncateText } from '@/lib/utils'
import { LeagueDescriptionClient } from './LeagueDescriptionClient'

interface LeagueDescriptionProps {
    league: LeagueType
    imageData: string
}

export const LeagueDescription = ({
    league,
    imageData,
}: LeagueDescriptionProps) => {
    return (
        <div className="flex flex-row gap-4 items-center">
            {imageData ? (
                <LeagueDescriptionClient
                    league={league}
                    imageData={imageData}
                />
            ) : (
                <div className="w-[75px] h-[75px] rounded-lg bg-gradient-to-br from-dark-grey to-clear-violet/30 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white"
                    >
                        {/* Trophy Cup */}
                        <path
                            d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V8C19 11.3137 16.3137 14 13 14H11C7.68629 14 5 11.3137 5 8V5Z"
                            fill="currentColor"
                            opacity="0.9"
                        />
                        
                        {/* Handles */}
                        <path
                            d="M3 6C3 5.44772 3.44772 5 4 5H5V8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8V6Z"
                            fill="currentColor"
                            opacity="0.7"
                        />
                        <path
                            d="M19 5H20C20.5523 5 21 5.44772 21 6V8C21 8.55228 20.5523 9 20 9C19.4477 9 19 8.55228 19 8V5Z"
                            fill="currentColor"
                            opacity="0.7"
                        />
                        
                        {/* Base */}
                        <path
                            d="M12 14C12 14 11 14 11 15V17H13V15C13 14 12 14 12 14Z"
                            fill="currentColor"
                            opacity="0.8"
                        />
                        <path
                            d="M8 17H16C16 17 17 17 17 18C17 19 16 19 16 19H8C8 19 7 19 7 18C7 17 8 17 8 17Z"
                            fill="currentColor"
                            opacity="0.8"
                        />
                        
                        {/* Star decoration */}
                        <path
                            d="M12 7L12.7 8.4L14.2 8.6L13.1 9.7L13.4 11.2L12 10.5L10.6 11.2L10.9 9.7L9.8 8.6L11.3 8.4L12 7Z"
                            fill="currentColor"
                            opacity="0.4"
                        />
                    </svg>
                </div>
            )}
            <div className="flex flex-col justify-center items-start gap-0">
                <Tooltip content={league.name || ''}>
                    <h1 className="font-medium  m-0 leading-none">
                        {(() => {
                            // Si le short existe et fait 4 caractères ou moins et n'est pas le même que le nom, on l'utilise
                            if (league.short && league.short.length <= 4 && league.short !== league.name) {
                                return league.short;
                            }
                            // Sinon on génère une abréviation
                            if (league.name) {
                                const words = league.name.split(' ');
                                if (words.length >= 2) {
                                    // Prendre la première lettre de chaque mot
                                    return words.map(word => word[0]).join('').slice(0, 2).toUpperCase();
                                } else {
                                    // Si un seul mot, prendre les 2 premières lettres
                                    return league.name.slice(0, 2).toUpperCase();
                                }
                            }
                            return '';
                        })()}
                    </h1>
                </Tooltip>
                <p className="text-clear-grey font-semibold m-0 leading-none">
                    {league.region}
                </p>
            </div>
        </div>
    )
}
