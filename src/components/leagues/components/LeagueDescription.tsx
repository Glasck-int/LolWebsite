import React from 'react'
import { Tooltip } from '../../utils/Tooltip'
import { League as LeagueType } from '../../../../backend/src/generated/prisma'
import { truncateText } from '@/lib/utils'
import { getLeagueImage } from '@/lib/api/image'
import { LeagueDescriptionClient } from './LeagueDescriptionClient'

interface LeagueDescriptionProps {
    league: LeagueType
}


export const LeagueDescription = async ({ league }: LeagueDescriptionProps) => {
    const image = await getLeagueImage(league.name || '')

    return (
        <div className="flex flex-row mb-4 gap-4 md:hidden">
            {image.data && (
                <LeagueDescriptionClient league={league} imageData={image.data} />
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
