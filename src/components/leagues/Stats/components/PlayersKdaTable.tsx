import { useTournament } from '@/contexts/TournamentContext'
import OverlayImage from '@/components/ui/OverlayImage'
import { ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'
// import PlayerAndTeam from '@/components/players/PlayerAndTeam'
// import { getPlayerByLink } from '@/lib/api/player'

export default function PlayersKdaTable({ processedData }: { processedData: ProcessedStanding[] }) {
    const { playerStats, Images } = useTournament()
    
    if (!playerStats || playerStats.length === 0) {
        return <div>No player stats available</div>
    }
    
    // Trier les joueurs par KDA décroissant et prendre les 3 premiers
    const topThreeKda = playerStats
        .sort((a, b) => b.kda - a.kda)
        .slice(0, 3)

    return (
        <section className="space-y-4">
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topThreeKda.map((player, index) => (
                    <li key={player.name} className=" rounded-lg border p-4 shadow-sm">
                        <header className="flex items-center justify-between mb-2">
                            <span className="text-lg font-semibold">{index + 1}.</span>
                            <data value={player.kda} className="text-2xl font-bold text-blue-600">{player.kda}</data>
                        </header>
                        <div className="text-center">
                            {Images?.[player.link] && (
                                <div className="mb-3 flex justify-center">
                                    <OverlayImage
                                        mainUrl={Images[player.link].playerImage}
                                        bottomUrl={Images[player.link].teamImage}
                                        mainAlt={`${player.name} avatar`}
                                        bottomAlt={`${player.team} logo`}
                                    
                                    />
                                </div>
                            )}
                            <h3 className="font-bold text-lg text-blue">{player.name}</h3>
                            <p className="text-sm text-gray-600">{player.team}</p>
                            <p className="text-sm text-gray-500">{player.role}</p>
                        </div>
                        <dl className="mt-3 text-sm space-y-1">
                            <div className="flex justify-between">
                                <dt>K/D/A:</dt>
                                <dd>{player.avgKills.toFixed(1)}/{player.avgDeaths.toFixed(1)}/{player.avgAssists.toFixed(1)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Games:</dt>
                                <dd>{player.gamesPlayed}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Win Rate:</dt>
                                <dd><data value={player.winRate}>{player.winRate}%</data></dd>
                            </div>
                        </dl>
                    </li>
                ))}
            </ol>
        </section>
    )
}