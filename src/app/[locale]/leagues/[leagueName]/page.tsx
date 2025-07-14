import React from 'react'
import { getLeagueBySlug } from '@/lib/api/league'
import {
    getTournamentsByLeagueName,
    getTournamentsStandingsByTournamentOverviewPage,
} from '@/lib/api/tournaments'
import { LeagueDescription } from '@/components/leagues/components/LeagueDescription'
import {
    Card,
    CardBody,
    CardBodyMultiple,
    CardBodyMultipleContent,
    CardHeader,
    CardHeaderBase,
    CardHeaderColumn,
    CardHeaderTab,
    CardHeaderContent,
} from '@/components/ui/card/index'
import { NextMatches } from '@/components/leagues/Matches/NextMatches'
import { StandingsOverview } from '@/components/leagues/Standings/views/StandingsOverview'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { StandingsWithTabs } from '@/components/leagues/Standings/views/StandingsWithTabs'

interface LeaguePageProps {
    params: Promise<{ leagueName: string }>
}

export default async function LeaguePage({ params }: LeaguePageProps) {
    const { leagueName } = await params

    try {
        const league = await getLeagueBySlug(leagueName)

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

        // Use specifically the Spring Split tournament
        const tournamentName = 'LEC/2025 Season/Spring Season'


        console.log('Selected tournament for standings:', tournamentName)

        const standings = await getTournamentsStandingsByTournamentOverviewPage(
            tournamentName
        )

        if (standings.error) {
            console.error('Standings error:', standings.error)
            return <div>Error loading standings: {standings.error}</div>
        }

        console.log('Ligue cliquée:', league.data?.name)
        console.log('Tournament used for standings:', tournamentName)
        console.log('Standings data:', standings.data?.length || 0, 'teams')

        return (
            <div className="pt-24 body-container">
                {league.data && <LeagueDescription league={league.data} />}
                {league.data && <NextMatches league={league.data} />}

                {standings.data && standings.data.length > 0 && (
                    <StandingsOverview
                        standings={standings.data}
                        tournamentName={tournamentName}
                        maxRows={3}
                    />
                )}

                {standings.data && standings.data.length > 0 && (
                    <StandingsWithTabs
                        standings={standings.data}
                        tournamentName={tournamentName}
                        maxRows={null}
                    />
                )}

                <Card>
                    <CardHeader>
                        <CardHeaderColumn>
                            <CardHeaderTab>
                                <CardHeaderContent>
                                    <p className="text-inherit text-semibold">
                                        BO/SERIE
                                    </p>
                                </CardHeaderContent>
                                <CardHeaderContent>
                                    <p className="text-inherit text-semibold">
                                        GAMES
                                    </p>
                                </CardHeaderContent>
                            </CardHeaderTab>
                            <CardHeaderBase>
                                <SubTitle>header</SubTitle>
                            </CardHeaderBase>
                        </CardHeaderColumn>
                    </CardHeader>
                    <CardBody>
                        <CardBodyMultiple>
                            <CardBodyMultipleContent>
                                
                            <div className="flex justify-center items-center h-full">
                                <p>body 1</p>
                            </div>
                            </CardBodyMultipleContent>
                            <CardBodyMultipleContent>
                                <p>body 2</p>
                            </CardBodyMultipleContent>
                            <CardBodyMultipleContent>
                                <p>body 3</p>
                            </CardBodyMultipleContent>
                            <CardBodyMultipleContent>
                                <p>test</p>
                            </CardBodyMultipleContent>
                        </CardBodyMultiple>
                    </CardBody>
                </Card>

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
                        Une erreur s'est produite lors du chargement de la page.
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
