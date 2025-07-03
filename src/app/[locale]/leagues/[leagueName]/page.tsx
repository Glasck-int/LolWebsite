import React from 'react'
import { getLeagueBySlug } from '@/lib/api/league'
import { getTournamentsByLeagueName } from '@/lib/api/tournaments'
import { getLeagueImage } from '@/lib/api/image'
import Image from 'next/image'
import { truncateText } from '@/lib/utils'
import { Tooltip } from '@/components/utils/Tooltip'

interface LeaguePageProps {
    params: Promise<{ leagueName: string }>
}

export default async function LeaguePage({ params }: LeaguePageProps) {
    const { leagueName } = await params
    const league = await getLeagueBySlug(leagueName)

    const image = await getLeagueImage(league.data?.name || '')

    const tournaments = await getTournamentsByLeagueName(
        league.data?.name || ''
    )
    if (league.error) {
        return <div>Error: {league.error}</div>
    }

    console.log('Ligue cliquée:', league.data?.name)

    return (
        <div className="pt-24 body-container">
            <div className="flex flex-row z-50 mb-4 gap-4 md:hidden">
                {image.data && (
                    <Image
                        src={image.data}
                        alt={league.data?.name || ''}
                        className="object-contain"
                        width={75}
                        height={75}
                    />
                )}
                <div className="flex flex-col justify-end items-start gap-0">
                    <Tooltip content={league.data?.name || ''}>
                        <h1 className="font-medium tracking-wider m-0 leading-none">
                            {truncateText(
                                league.data?.short || league.data?.name || '',
                                20
                            )}
                        </h1>
                    </Tooltip>
                    <p className="text-clear-grey font-semibold m-0 leading-none">
                        {league.data?.region}
                    </p>
                </div>
            </div>
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
