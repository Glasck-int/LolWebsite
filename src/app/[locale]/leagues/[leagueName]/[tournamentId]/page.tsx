import React from 'react'
import { Metadata } from 'next'
import { getLeagueByName } from '@/lib/api/league'
import { getTournamentById } from '@/lib/api/tournament'
import { getLeagueImage } from '@/lib/api/image'
import { LeagueTableEntityClient } from '@/components/leagues/components/LeagueTableEntityClient'

interface TournamentPageProps {
    params: Promise<{ 
        leagueName: string
        tournamentId: string
        locale: string
    }>
}

export async function generateMetadata({ params }: TournamentPageProps): Promise<Metadata> {
    const { leagueName, tournamentId } = await params
    
    try {
        const [league, tournament] = await Promise.all([
            getLeagueByName(leagueName),
            getTournamentById(parseInt(tournamentId))
        ])
        
        if (league.error || tournament.error) {
            return {
                title: 'League of Legends Esports',
                description: 'Competitive League of Legends statistics and standings'
            }
        }
        
        const tournamentName = tournament.data?.name || 'Tournament'
        const leagueDisplayName = league.data?.name || 'League'
        
        return {
            title: `${tournamentName} - ${leagueDisplayName} | Glasck`,
            description: `${tournamentName} standings, matches, and statistics for ${leagueDisplayName}. Follow live results, team rankings, and player performance.`,
            openGraph: {
                title: `${tournamentName} - ${leagueDisplayName}`,
                description: `Latest ${tournamentName} standings and match results`,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${tournamentName} - ${leagueDisplayName}`,
                description: `Latest ${tournamentName} standings and match results`,
            }
        }
    } catch (error) {
        console.error('Error generating metadata:', error)
        return {
            title: 'League of Legends Esports',
            description: 'Competitive League of Legends statistics and standings'
        }
    }
}

export default async function TournamentPage({ params }: TournamentPageProps) {
    const { leagueName, tournamentId } = await params
    
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
                    {league.data && (
                        <LeagueTableEntityClient
                            leagueId={league.data.id}
                            league={league.data}
                            imageData={leagueImage.data || ''}
                            initialTournamentId={parseInt(tournamentId)}
                        />
                    )}
                </div>
                
                <div className="hidden md:block">
                    {league.data && (
                        <LeagueTableEntityClient
                            leagueId={league.data.id}
                            league={league.data}
                            imageData={leagueImage.data || ''}
                            initialTournamentId={parseInt(tournamentId)}
                        />
                    )}
                </div>
            </div>
        )
    } catch (error) {
        console.error('Unexpected error in TournamentPage:', error)
        return (
            <div>
                <div className="text-red-500">
                    <h1>Erreur inattendue</h1>
                    <p>Une erreur s&apos;est produite lors du chargement de la page.</p>
                    <p>
                        Détails: {error instanceof Error ? error.message : 'Erreur inconnue'}
                    </p>
                </div>
            </div>
        )
    }
}