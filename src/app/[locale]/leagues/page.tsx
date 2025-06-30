import React from 'react'
import Footer from '@/components/layout/Footer/Footer'
import {
    getAllLeagues,
    getMajorLeagues,
    getLeagueImage,
} from '../../../lib/api/league'
import { LeaguesClient } from './LeaguesClient'

/**
 * Leagues page component
 *
 * Displays all leagues and major leagues fetched from the API
 */
export default async function Leagues() {
    const [allLeaguesResponse, majorLeaguesResponse] = await Promise.all([
        getAllLeagues(),
        getMajorLeagues(),
    ])

    if (allLeaguesResponse.error || majorLeaguesResponse.error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl mb-4">Error loading leagues</h1>
                <p className="text-red-600">
                    {allLeaguesResponse.error || majorLeaguesResponse.error}
                </p>
                <Footer />
            </div>
        )
    }

    const allLeagues = allLeaguesResponse.data || []
    const majorLeagues = majorLeaguesResponse.data || []

    const nonInternationalLeagues = majorLeagues.filter(
        (league) => league.region !== 'International'
    )
    const internationalLeagues = majorLeagues.filter(
        (league) => league.region === 'International'
    )

    const [majorLeaguesImages, internationalLeaguesImages] = await Promise.all([
        Promise.all(
            nonInternationalLeagues.map((league) => getLeagueImage(league.name))
        ),
        Promise.all(
            internationalLeagues.map((league) => getLeagueImage(league.name))
        ),
    ])

    const majorImages = majorLeaguesImages.map((response) => response.data)
    const internationalImages = internationalLeaguesImages.map(
        (response) => response.data
    )

    return (
        <LeaguesClient
            allLeagues={allLeagues}
            majorLeagues={nonInternationalLeagues}
            internationalLeagues={internationalLeagues}
            majorImages={majorImages as string[]}
            internationalImages={internationalImages as string[]}
        />
    )
}
