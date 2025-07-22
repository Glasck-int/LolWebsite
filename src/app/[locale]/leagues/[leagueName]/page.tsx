import React from 'react'
import { getLeagueByName } from '@/lib/api/league'
import {
    getTournamentsByLeagueName,
    getTournamentsStandingsByTournamentOverviewPage,
    getTournamentPlayersStatsByTournamentOverviewPage,
} from '@/lib/api/tournaments'
import { fetchEnrichedStandingsData } from '@/lib/api/standings'
import { getPlayerImage } from '@/lib/api/player'
import { LeagueDescription } from '@/components/leagues/components/LeagueDescription'
import { NextMatches } from '@/components/leagues/Matches/NextMatches'
import { StandingsOverviewClient } from '@/components/leagues/Standings/views/StandingsOverviewClient'
import { StandingsWithTabsClient } from '@/components/leagues/Standings/views/StandingsWithTabsClient'
import PlayersKda from '@/components/leagues/Stats/views/playersKda'

import { TournamentProvider } from '@/contexts/TournamentContext'
import { getTeamImage } from '@/lib/api/image'
import { getTeamsByNames } from '@/lib/api/teams'

interface LeaguePageProps {
    params: Promise<{ leagueName: string }>
}

export default async function LeaguePage({ params }: LeaguePageProps) {
    const { leagueName } = await params

    try {
        const league = await getLeagueByName(leagueName)

        if (league.error) {
            console.error('League error:', league.error)
            return <div>Error loading league: {league.error}</div>
        }

        const tournaments = await getTournamentsByLeagueName(
            league.data?.name || ''
        )

        if (tournaments.error) {
            console.error('Tournaments error:', tournaments.error)
            return <div>Error loading tournaments: {tournaments.error}</div>
        }

        const tournamentName = 'LEC/2025 Season/Spring Season'
        const tournamentId = '5165'

        const playerStats =
            await getTournamentPlayersStatsByTournamentOverviewPage(
                tournamentName
            )

        if (playerStats.error) {
            console.error('Player stats error:', playerStats.error)
            return <div>Error loading player stats: {playerStats.error}</div>
        }

        const standings = await getTournamentsStandingsByTournamentOverviewPage(
            tournamentName
        )

        if (standings.error) {
            console.error('Standings error:', standings.error)
            return <div>Error loading standings: {standings.error}</div>
        }

        // Fetch enriched standings data server-side
        const enrichedStandingsData = await fetchEnrichedStandingsData(
            standings.data || [],
            tournamentName
        )

        // Fetch player images server-side
        const playerImagesArray = await Promise.all(
            playerStats.data?.players.map(async (player) => {
                const playerImage = await getPlayerImage(player.link, tournamentName)
                const teams = await getTeamsByNames([player.team])
                const teamImage = await getTeamImage(teams.data?.[0]?.image?.replace('.png', '.webp') || '')
                return {
                    link: player.link,
                    playerImage: playerImage.data || '',
                    teamImage: teamImage.data || ''
                }
            }) || []
        )
        
        // Convert to object with player link as key
        const playerImages = playerImagesArray.reduce((acc, { link, playerImage, teamImage }) => {
            acc[link] = {
                playerImage: playerImage,
                teamImage: teamImage
            }
            return acc
        }, {} as Record<string, { playerImage: string, teamImage: string }>)

        // console.log('playerImages', playerImages)

        return (
            <div className="pt-24 body-container">
                {league.data && <LeagueDescription league={league.data} />}
                {league.data && (
                    <>
                        <NextMatches lastMatches={false} tournamentId={tournamentId} />
                    </>
                )}
                {standings.data &&
                    standings.data.length > 0 &&
                    playerStats.data?.players && (
                        <TournamentProvider
                            standings={standings.data}
                            playerStats={playerStats.data.players}
                            tournamentName={tournamentName}
                            enrichedStandingsData={
                                enrichedStandingsData.processedData
                            }
                            enrichedGamesData={enrichedStandingsData.gamesData}
                            Images={playerImages}
                        >
                            {playerStats.data.players.length > 0 && (
                                <PlayersKda />
                            )}
                            <div className="flex flex-row gap-4">
                                <StandingsOverviewClient maxRows={3} />
                            </div>

                            <StandingsWithTabsClient maxRows={null} />
                        </TournamentProvider>
                    )}

                <h1>Page de la ligue: {league.data?.name}</h1>
                <p>Slug: {league.data?.slug}</p>
                <p>ID: {league.data?.id}</p>
                <p>Short: {league.data?.short}</p>
                <p>Region: {league.data?.region}</p>
                <p>Level: {league.data?.level}</p>
                <p>IsOfficial: {league.data?.isOfficial ? 'Oui' : 'Non'}</p>
                <p>IsMajor: {league.data?.isMajor ? 'Oui' : 'Non'}</p>
                <h2>Tournaments</h2>
                <ul className="list-disc text-red-500">
                    {tournaments.data?.map((tournament) => (
                        <li key={tournament.id}>
                            {tournament.overviewPage} -{' '}
                            {tournament.dateStart?.toString() || 'N/A'} -{' '}
                            {tournament.dateEnd?.toString() || 'N/A'} -{' '}
                            {tournament.dateStartFuzzy?.toString() || 'N/A'}
                        </li>
                    ))}
                </ul>
            </div>
        )
    } catch (error) {
        console.error('Unexpected error in LeaguePage:', error)
        return (
            <div className="pt-24 body-container">
                <div className="text-red-500">
                    <h1>Erreur inattendue</h1>
                    <p>
                        Une erreur s&apos;est produite lors du chargement de la
                        page.
                    </p>
                    <p>
                        Détails:{' '}
                        {error instanceof Error
                            ? error.message
                            : 'Erreur inconnue'}
                    </p>
                </div>
            </div>
        )
    }
}
