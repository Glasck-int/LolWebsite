'use client'
import { useTournament } from '@/contexts/TournamentContext'
import PlayerAndTeam from '@/components/players/PlayerAndTeam'
import { getPlayerByLink } from '@/lib/api/player'

export default function PlayersKdaTable() {
    const { playerStats } = useTournament()
    // const playerLinks = playerStats.map((player) => player.link)
    // const players = await getPlayerByLink("Caliste")

    return (
        <div>
            <h1>Player KDA Table</h1>
            {/* Display the name of the first player in the players.data array if available */}
            {/* <PlayerAndTeam players={playerStats.map((player) => player.link).join(', ')} team={playerStats[0].team} /> */}
        </div>
    )
}