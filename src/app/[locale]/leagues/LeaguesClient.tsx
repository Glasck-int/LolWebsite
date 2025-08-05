'use client'

import React from 'react'
import Footer from '@/components/layout/Footer/Footer'
import { LeagueSection } from '@/components/leagues'
import { FunctionalSearchBar } from '@/components/ui/search/FunctionalSearchBar'
import { OfficialToggle } from '@/components/utils/OfficialToggle'
import { useLeagueSearch } from '@/lib/hooks/useLeagueSearch'
import { League as LeagueType } from '@/generated/prisma'
import Image from 'next/image'
import { getApiBaseUrl } from '@/lib/api/utils'

interface LeaguesClientProps {
    allLeagues: LeagueType[]
    majorLeagues: LeagueType[]
    internationalLeagues: LeagueType[]
    majorImages: string[]
    internationalImages: string[]
}

/**
 * Client-side leagues component with search functionality
 *
 * Handles the interactive search and filtering of leagues
 *
 * @param allLeagues - All available leagues
 * @param majorLeagues - Major leagues (non-international)
 * @param internationalLeagues - International leagues
 * @param majorImages - Image URLs for major leagues
 * @param internationalImages - Image URLs for international leagues
 * @returns Interactive leagues page with search functionality
 */
export const LeaguesClient: React.FC<LeaguesClientProps> = ({
    allLeagues,
    majorLeagues,
    internationalLeagues,
    majorImages,
    internationalImages,
}) => {
    const {
        searchTerm,
        setSearchTerm,
        filteredLeagues,
        totalResults,
        onlyOfficial,
        setOnlyOfficial,
    } = useLeagueSearch({
        leagues: allLeagues,
        maxResults: 30,
    })

    const handleSearch = (term: string) => {
        setSearchTerm(term)
    }

    const baseUrl = getApiBaseUrl()
    const glasckIconWhite = `${baseUrl}/static/assets/svg/favicon/Fichier 8.svg`

    return (
        <div className="w-full px-4 py-8 block  relative">
            <div className="absolute top-25 left-50 z-[-1]">
                <Image
                    src={glasckIconWhite}
                    alt="logo"
                    width={70}
                    height={70}
                    className="opacity-25"
                />
            </div>
            <LeagueSection
                title={['LIGUES', 'MAJEURES']}
                leagues={majorLeagues}
                images={majorImages}
                square={true}
            />

            <LeagueSection
                title={['LIGUES', 'INTERNATIONALES']}
                leagues={internationalLeagues}
                images={internationalImages}
                square={true}
            />

            <div className="mb-8">
                <div className="flex flex-col mb-4">
                    <h1 className="text-7xl mb-4">TOUTES LES LIGUES</h1>
                </div>

                <div className="w-full mb-4">
                    <FunctionalSearchBar
                        onSearch={handleSearch}
                        placeholder="Rechercher une ligue..."
                        className="w-full"
                    />
                </div>

                {/* Official leagues toggle */}
                <div className="mb-4">
                    <OfficialToggle
                        onlyOfficial={onlyOfficial}
                        onToggle={setOnlyOfficial}
                    />
                </div>

                {searchTerm ? (
                    <>
                        <LeagueSection
                            leagues={filteredLeagues}
                            square={false}
                        />
                        {totalResults > 30 && (
                            <div className="text-center text-gray-400 mt-4 text-sm">
                                Affichage de {filteredLeagues.length} résultats
                                sur {totalResults} trouvés
                            </div>
                        )}
                    </>
                ) : (
                    <LeagueSection
                        title={[]}
                        leagues={allLeagues}
                        square={false}
                    />
                )}
            </div>

            <Footer />
        </div>
    )
}
