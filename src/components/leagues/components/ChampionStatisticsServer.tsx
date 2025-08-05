import React from 'react'
import { ChampionStatistics } from './ChampionStatistics'

interface ChampionStatisticsServerProps {
    tournamentId: string
}

/**
 * Server Component wrapper for ChampionStatistics
 * Fetches data on the server and passes it to the client component
 */
export async function ChampionStatisticsServer({ tournamentId }: ChampionStatisticsServerProps) {
    // Fetch data on the server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/champions/tournament/${tournamentId}`, {
        next: { 
            revalidate: 3600, // Cache for 1 hour
            tags: [`champion-stats-${tournamentId}`]
        }
    })
    
    if (!response.ok) {
        return <ChampionStatistics tournamentId={tournamentId} />
    }
    
    const data = await response.json()
    
    // Pass pre-fetched data to client component
    return <ChampionStatistics tournamentId={tournamentId} initialData={data} />
}