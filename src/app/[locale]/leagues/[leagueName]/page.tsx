import React from 'react'
import { getLeagueBySlug } from '@/lib/api/league'
import { getTournamentsByLeagueName } from '@/lib/api/tournaments'
import { getNextThreeMatchesForLeague } from '@/lib/api/league'
import { LeagueDescription } from '@/components/leagues/leagueDescription'
import {
    Card,
    CardBody,
    CardHeader,
    CardOneHeader,
} from '@/components/ui/card/Card'
import { getTeamsByNames } from '@/lib/api/teams'
import { NextMatches } from '@/components/leagues/nextMatches'

interface LeaguePageProps {
    params: Promise<{ leagueName: string }>
}

export default async function LeaguePage({ params }: LeaguePageProps) {
    const { leagueName } = await params
    const league = await getLeagueBySlug(leagueName)

    const tournaments = await getTournamentsByLeagueName(
        league.data?.name || ''
    )
    if (league.error) {
        return <div>Error: {league.error}</div>
    }

    // Fetch team information for all unique team names

    // // Create a map for quick team lookup
    // const teamsMap = new Map<string, any>()
    // teamsData.data?.forEach((team) => {
    //     if (team.overviewPage) {
    //         teamsMap.set(team.overviewPage, team)
    //     }
    // })

    console.log('Ligue cliquée:', league.data?.name)
    // console.log('Teams found:', teamsData.data?.length || 0)

    return (
        <div className="pt-24 body-container">
            {league.data && <LeagueDescription league={league.data} />}
            {league.data && <NextMatches league={league.data} />}
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
                        {tournament.name} -{' '}
                        {tournament.dateStart?.toString() || 'N/A'} -{' '}
                        {tournament.dateEnd?.toString() || 'N/A'} -{' '}
                        {tournament.dateStartFuzzy?.toString() || 'N/A'}
                    </li>
                ))}
            </ul>
        </div>
    )
}
