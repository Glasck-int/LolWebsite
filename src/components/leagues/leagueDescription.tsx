import React from 'react'
import { Tooltip } from '../utils/Tooltip'
import { League as LeagueType } from '../../../backend/src/generated/prisma'
import Image from 'next/image'
import { truncateText } from '@/lib/utils'
import { getLeagueImage } from '@/lib/api/image'
interface LeagueDescriptionProps {
    league: LeagueType
}

export const LeagueDescription = async ({ league }: LeagueDescriptionProps) => {
        const image = await getLeagueImage(league.name || '')

    return (
         <div className="flex flex-row z-50 mb-4 gap-4 md:hidden">
                {image.data && (
                    <Image
                        src={image.data}
                        alt={league.name || ''}
                        className="object-contain"
                        width={75}
                            height={75}
                        />
                )}
                <div className="flex flex-col justify-end items-start gap-0">
                    <Tooltip content={league.name || ''}>
                        <h1 className="font-medium tracking-wider m-0 leading-none">
                            {truncateText(
                                league.short || league.name || '',
                                20
                            )}
                        </h1>
                    </Tooltip>
                    <p className="text-clear-grey font-semibold m-0 leading-none">
                        {league.region}
                    </p>
                </div>
            </div>
    )
}
