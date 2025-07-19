import React from 'react'
import Footer from '@/components/layout/Footer/Footer'
import { getAllLeagues, getMajorLeagues } from '../../../lib/api/league'
import { LeaguesClient } from './LeaguesClient'
import { getLeagueImage } from '@/lib/api/image'
import { generateMetadata } from './metadata'

async function getLeaguesData() {
    console.log('🔄 [CACHE] Fetching fresh data...')

    const [allLeaguesResponse, majorLeaguesResponse] = await Promise.all([
        getAllLeagues(),
        getMajorLeagues(),
    ])

    if (allLeaguesResponse.error || majorLeaguesResponse.error) {
        throw new Error(
            allLeaguesResponse.error || majorLeaguesResponse.error
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

    // Charger les images
    const [majorLeaguesImages, internationalLeaguesImages] =
        await Promise.all([
            Promise.all(
                nonInternationalLeagues.map((league) =>
                    getLeagueImage(league.name)
                )
            ),
            Promise.all(
                internationalLeagues.map((league) =>
                    getLeagueImage(league.name)
                )
            ),
        ])

    const majorImages = majorLeaguesImages.map((response) => response.data)
    const internationalImages = internationalLeaguesImages.map(
        (response) => response.data
    )

    return {
        allLeagues,
        nonInternationalLeagues,
        internationalLeagues,
        majorImages,
        internationalImages,
    }
}

/**
 * Metadata for the Leagues page
 */
export { generateMetadata }

export const revalidate = 86400 // 24 hours

/**
 * Leagues page component
 *
 * Displays all leagues and major leagues fetched from the API
 */

 export default async function Leagues() {

     try {
         const data = await getLeaguesData()

         console.log('✅ [LEAGUES] Data retrieved (cached or fresh)')

         return (
             <LeaguesClient
                 allLeagues={data.allLeagues}
                 majorLeagues={data.nonInternationalLeagues}
                 internationalLeagues={data.internationalLeagues}
                 majorImages={data.majorImages as string[]}
                 internationalImages={data.internationalImages as string[]}
             />
         )
     } catch (error) {
         console.error('❌ [LEAGUES] Error:', error)
         return (
             <div className="container mx-auto px-4 py-8">
                 <h1 className="text-2xl mb-4">Error loading leagues</h1>
                 {/* <p className="text-red-600">{error.message}</p> */}
                 <Footer />
             </div>
         )
     }
 }
