import React from 'react'
import { Metadata } from 'next'
import { getLeagueByName } from '@/lib/api/league'
import { LeagueDescription } from '@/components/leagues/components/LeagueDescription'
import { getLeagueImage } from '@/lib/api/image'
import { LeagueTableEntityClient } from '@/components/leagues/components/LeagueTableEntityClient'

interface LeaguePageProps {
    params: Promise<{ 
        slug: string[]
        locale: string 
    }>
    searchParams: Promise<{
        tournament?: string
        season?: string
        split?: string
    }>
}

function parseLeagueSlug(slug: string[], searchParams?: { tournament?: string; season?: string; split?: string }) {
    // Parse the slug array to extract league name and optional tournament info
    // Examples:
    // ['lec'] -> { leagueName: 'lec' }
    // ['lec', '2025'] -> { leagueName: 'lec', season: '2025' }
    // ['lec', '2025', 'spring'] -> { leagueName: 'lec', season: '2025', split: 'spring' }
    // ['lec', '2025', 'spring', 'playoffs'] -> { leagueName: 'lec', season: '2025', split: 'spring', tournament: 'playoffs' }
    
    const [leagueName, season, split, tournament] = slug
    
    // Use URL segments first, then fall back to query parameters for backward compatibility
    return {
        leagueName: leagueName ? decodeURIComponent(leagueName) : '',
        season: season || searchParams?.season || undefined,
        split: split || searchParams?.split || undefined,
        tournament: tournament || searchParams?.tournament || undefined
    }
}

// ISR Configuration - Balanced cache strategy for league pages
export const revalidate = 1800 // 30 minutes base revalidation

export async function generateMetadata({ params, searchParams }: LeaguePageProps): Promise<Metadata> {
    const { slug } = await params
    const searchParamsResolved = await searchParams
    const { leagueName } = parseLeagueSlug(slug, searchParamsResolved)
    
    return {
        title: `${leagueName.toUpperCase()} - League`,
        description: `View tournaments, standings, matches and statistics for ${leagueName.toUpperCase()} league`,
    }
}

export default async function LeaguePage({ params, searchParams }: LeaguePageProps) {
    const { slug } = await params
    const searchParamsResolved = await searchParams
    const { leagueName, season, split, tournament } = parseLeagueSlug(slug, searchParamsResolved)

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
                        initialSeason={season}
                        initialSplit={split}
                        initialTournament={tournament}
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