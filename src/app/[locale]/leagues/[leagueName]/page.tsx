import React from 'react'
import { Metadata } from 'next'
import { getLeagueByName } from '@/lib/api/league'
import { LeagueDescription } from '@/components/leagues/components/LeagueDescription'
import { getLeagueImage } from '@/lib/api/image'
import { LeagueTableEntityClient } from '@/components/leagues/components/LeagueTableEntityClient'
import { generateLeagueMetadata } from './metadata'

interface LeaguePageProps {
    params: Promise<{ leagueName: string }>
}

export async function generateMetadata({ params }: LeaguePageProps): Promise<Metadata> {
    const { leagueName } = await params
    return generateLeagueMetadata({ leagueName })
}

export default async function LeaguePage({ params }: LeaguePageProps) {
    const { leagueName } = await params

    try {
        const league = await getLeagueByName(leagueName)

        if (league.error) {
            console.error('League error:', league.error)
            return <div>Error loading league: {league.error}</div>
        }
        const leagueImage = await getLeagueImage(league.data?.name || '')


        return (
            <div className="">
                <div className="block md:hidden">
                    {league.data && <LeagueDescription league={league.data} imageData={leagueImage.data || ''} />}
                </div>

                {league.data && (
                    <LeagueTableEntityClient 
                        leagueId={league.data.id}
                        league={league.data}
                        imageData={leagueImage.data || ''}
                        />
                )}
            </div>
        )
    } catch (error) {
        console.error('Unexpected error in LeaguePage:', error)
        return (
            <div>
                <div className="text-clear-grey">
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
