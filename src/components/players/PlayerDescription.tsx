import React from 'react'
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
            {playerImage && (
                <PlayerDescriptionClient
                    playerData={playerData}
                    playerImage={playerImage}
                    teamImage={teamImage}
                    teamName={teamName}
                />
            )}
        </div>
    )
}