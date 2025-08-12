'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getTournamentsByLeagueName } from '@/lib/api/tournaments'

interface TournamentMetaData {
    title: string
    description: string
    tournamentName: string
    leagueName: string
}

/**
 * Hook to dynamically update page metadata based on URL tournament parameters
 * This updates the document title and meta description when tournament changes
 */
export const useDynamicTournamentMetadata = (leagueName: string | null) => {
    const searchParams = useSearchParams()
    const tournamentParam = searchParams.get('tournament')
    const seasonParam = searchParams.get('season')
    const splitParam = searchParams.get('split')

    useEffect(() => {
        // Don't do anything if no league name is provided
        if (!leagueName) {
            return
        }
        
        const updateMetadata = async () => {
            try {
                let metaData: TournamentMetaData = {
                    title: `${leagueName} - League of Legends Esports | Glasck`,
                    description: `${leagueName} standings, matches, and tournament results. Follow live results, team rankings, and player statistics.`,
                    tournamentName: '',
                    leagueName
                }

                // If we have tournament selection, fetch tournament details
                if (tournamentParam && tournamentParam !== 'all') {
                    try {
                        // Try to get tournament details
                        const tournaments = await getTournamentsByLeagueName(leagueName)
                        
                        // Try to find tournament matching both name and season
                        let tournament = tournaments.data?.find(t => 
                            t.name === tournamentParam && seasonParam && t.name.includes(seasonParam)
                        )
                        
                        // Fallback: try to find by tournament name and season separately
                        if (!tournament && seasonParam) {
                            tournament = tournaments.data?.find(t => 
                                t.name?.includes(tournamentParam) && t.name.includes(seasonParam)
                            )
                        }
                        
                        // Last fallback: just by tournament name (original logic)
                        if (!tournament) {
                            tournament = tournaments.data?.find(t => 
                                t.name === tournamentParam || t.name?.includes(tournamentParam)
                            )
                        }

                        if (tournament) {
                            // Use tournament name directly if it exists (it already contains season/split info)
                            metaData = {
                                title: `${tournament.name} - ${leagueName} | Glasck`,
                                description: `${tournament.name} standings and live results for ${leagueName}. Follow team rankings, match schedules, and player statistics.`,
                                tournamentName: tournament.name || tournamentParam,
                                leagueName
                            }
                        } else {
                            // Fallback with parameter values
                            const seasonText = seasonParam ? ` ${seasonParam}` : ''
                            const splitText = splitParam && splitParam !== 'all' ? ` ${splitParam}` : ''
                            
                            metaData = {
                                title: `${tournamentParam}${seasonText}${splitText} - ${leagueName} | Glasck`,
                                description: `${tournamentParam} tournament${seasonText}${splitText} standings and live results for ${leagueName}. Follow team rankings, match schedules, and player statistics.`,
                                tournamentName: tournamentParam,
                                leagueName
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching tournament details for metadata:', error)
                        // Use fallback metadata
                    }
                } else if (seasonParam === 'all') {
                    metaData = {
                        title: `All Seasons - ${leagueName} | Glasck`,
                        description: `Complete ${leagueName} history across all seasons. View historical standings, tournament results, and player statistics.`,
                        tournamentName: 'All Seasons',
                        leagueName
                    }
                } else if (splitParam === 'all' && seasonParam) {
                    metaData = {
                        title: `${seasonParam} All Splits - ${leagueName} | Glasck`,
                        description: `Complete ${seasonParam} season overview for ${leagueName}. View all tournament results, standings, and player statistics.`,
                        tournamentName: `${seasonParam} All Splits`,
                        leagueName
                    }
                }

                // Update document title
                if (typeof document !== 'undefined') {
                    document.title = metaData.title
                    
                    // Update meta description
                    const metaDescription = document.querySelector('meta[name="description"]')
                    if (metaDescription) {
                        metaDescription.setAttribute('content', metaData.description)
                    }
                    
                    // Update Open Graph tags
                    const ogTitle = document.querySelector('meta[property="og:title"]')
                    if (ogTitle) {
                        ogTitle.setAttribute('content', metaData.title)
                    }
                    
                    const ogDescription = document.querySelector('meta[property="og:description"]')
                    if (ogDescription) {
                        ogDescription.setAttribute('content', metaData.description)
                    }
                    
                    // Update Twitter tags
                    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
                    if (twitterTitle) {
                        twitterTitle.setAttribute('content', metaData.title)
                    }
                    
                    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
                    if (twitterDescription) {
                        twitterDescription.setAttribute('content', metaData.description)
                    }

                    // Dispatch custom event for analytics or other purposes
                    const event = new CustomEvent('tournamentMetadataUpdate', {
                        detail: metaData
                    })
                    window.dispatchEvent(event)
                }

            } catch (error) {
                console.error('Error updating tournament metadata:', error)
            }
        }

        updateMetadata()
    }, [tournamentParam, seasonParam, splitParam, leagueName])

    return {
        tournamentParam,
        seasonParam,
        splitParam
    }
}