import React from 'react'
import { Tooltip } from '../../utils/Tooltip'
import { League as LeagueType } from '@/generated/prisma'
import { truncateText } from '@/lib/utils'
import { getLeagueImage } from '@/lib/api/image'
import { LeagueDescriptionClient } from './LeagueDescriptionClient'

interface LeagueDescriptionProps {
    league: LeagueType
    imageData: string
}


export const LeagueDescription =  ({ league, imageData }: LeagueDescriptionProps) => {

    return (
        <div className="flex flex-row mb-4 gap-4">
            {imageData && (
                <LeagueDescriptionClient league={league} imageData={imageData} />
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
