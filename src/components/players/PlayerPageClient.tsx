'use client'

import { PlayerTableEntityClient } from './PlayerTableEntityClient'
import { PlayerWithRedirects } from '@glasck-int/glasck-types'

interface PlayerPageClientProps {
    playerName: string
    playerData?: PlayerWithRedirects
    playerImage?: string
    initialSeason?: string
    initialSplit?: string
    initialTournament?: string
}

export function PlayerPageClient({
    playerName,
    playerData,
    playerImage,
    initialSeason,
    initialSplit,
    initialTournament
}: PlayerPageClientProps) {
    return (
        <PlayerTableEntityClient 
            playerName={playerName}
            playerData={playerData}
            playerImage={playerImage}
            initialSeason={initialSeason}
            initialSplit={initialSplit}
            initialTournament={initialTournament}
        />
    )
}