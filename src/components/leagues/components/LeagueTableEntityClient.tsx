'use client'

import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTableEntityData } from '@/hooks/useTableEntityData'
import { useTableEntityStore, SeasonData, TabConfig } from '@/store/tableEntityStore'
import {
    TableEntityLayout,
    TableEntityHeader,
    TableEntityBody,
    TableEntityContent,
} from '@/components/layout/TableEntityLayout/TableEntityLayout'
import {
    Card,
    CardBody,
    CardFooter,
    CardFooterContent,
} from '@/components/ui/card'
import {
    LeagueDescription,
    NextMatchesClient,
    StandingsOverviewFetch,
    StandingsWithTabsFetch,
} from '@/components/leagues'
import {
    League,
    Standings,
    MatchSchedule,
    MatchScheduleGame,
} from '@/generated/prisma'
import { ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'

interface LeagueTableEntityClientProps {
    leagueId: number
    league?: League
    standings?: Standings[]
    playerStats?: unknown
    tournamentName?: string
    enrichedStandingsData?: ProcessedStanding[]
    enrichedGamesData?: MatchScheduleGame[]
    playerImages?: Record<string, { playerImage: string; teamImage: string }>
    matches?: MatchSchedule[]
    teamsData?: Array<{
        short?: string | null
        image?: string | null
        overviewPage?: string | null
    }>
    teamImages?: Array<{
        team1Image?: string | null
        team2Image?: string | null
    }>
    imageData?: string
}

// Tab configuration specific to League pages
const LEAGUE_TAB_CONFIG: TabConfig[] = [
    { index: 0, name: 'apercu', displayName: 'Aperçu' },
    { index: 1, name: 'matchs', displayName: 'Matchs' },
    { index: 2, name: 'statistiques', displayName: 'Statistiques' },
    { index: 3, name: 'tournois', displayName: 'Tournois' }
]

const LeagueTableEntityContent = ({
    league,
    standings,
    playerStats,
    tournamentName,
    enrichedStandingsData,
    enrichedGamesData,
    playerImages,
    imageData,
    seasons,
}: Omit<LeagueTableEntityClientProps, 'leagueId'> & {
    seasons: SeasonData[]
}) => {
    const searchParams = useSearchParams()
    const { activeId, activeIndex, syncFromUrl, setActiveTab, setTabConfigs } = useTableEntityStore()
    const selectedTournamentId = activeId.length > 0 ? activeId[0] : null

    // Set tab configuration and sync store state from URL parameters on mount
    useEffect(() => {
        // Set the tab configuration for this component
        setTabConfigs(LEAGUE_TAB_CONFIG)
        
        if (seasons.length > 0) {
            // Sync all state (season/split/tournament/tab) from URL
            syncFromUrl(searchParams, seasons)
        }
    }, [seasons.length > 0, setTabConfigs, syncFromUrl, searchParams]) // Only run when seasons are available

    return (
        <>
            <Card>
                <CardBody>
                    <div className="hidden md:flex p-[15px] h-[130px] gap-3 w-[250px] items-center justify-center">
                        {league && (
                            <LeagueDescription
                                league={league}
                                imageData={imageData || ''}
                            />
                        )}
                    </div>
                    <TableEntityHeader seasons={seasons} />
                </CardBody>
                <CardFooter>
                    {LEAGUE_TAB_CONFIG.map((tab) => (
                        <CardFooterContent key={tab.index}>
                            <p 
                                className="text-inherit cursor-pointer hover:text-white"
                                onClick={() => setActiveTab(tab.index)}
                            >
                                {tab.displayName}
                            </p>
                        </CardFooterContent>
                    ))}
                </CardFooter>
            </Card>
            {/* Body avec le contenu des différents onglets */}
            <TableEntityBody>
                <TableEntityContent>
                    <div className="space-y-4">
                        <div className="space-y-4">
                            {/* Next Matches */}
                            {selectedTournamentId ? (
                                <NextMatchesClient
                                    tournamentId={selectedTournamentId}
                                    showSingleMatchOnDesktop={false}
                                />
                            ) : (
                                <div className="p-4 bg-gray-700 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">
                                        Matchs
                                    </h3>
                                    <p>
                                        Sélectionnez un tournoi pour voir les
                                        matchs
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Standings Overview */}
                        {selectedTournamentId ? (
                            <StandingsOverviewFetch
                                tournamentId={selectedTournamentId}
                                maxRows={3}
                            />
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Aperçu
                                </h3>
                                <p>Sélectionnez un tournoi pour voir le classement</p>
                            </div>
                        )}
                    </div>
                </TableEntityContent>
                <TableEntityContent>
                    <div className="space-y-4">
                        <p>matchs</p>
                    </div>
                </TableEntityContent>
                <TableEntityContent>
                    <div className="space-y-4">
                        <p>stats</p>
                    </div>
                </TableEntityContent>
                <TableEntityContent>
                    <div className="space-y-4">
                        {/* Players KDA et Standings With Tabs */}
                        {selectedTournamentId ? (
                            <StandingsWithTabsFetch
                                tournamentId={selectedTournamentId}
                                maxRows={null}
                            />
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Statistiques
                                </h3>
                                <p>Sélectionnez un tournoi pour voir les statistiques</p>
                            </div>
                        )}
                    </div>
                </TableEntityContent>
            </TableEntityBody>
        </>
    )
}

export const LeagueTableEntityClient = ({
    leagueId,
    league,
    standings,
    playerStats,
    tournamentName,
    enrichedStandingsData,
    enrichedGamesData,
    playerImages,
    matches,
    teamsData,
    teamImages,
    imageData,
}: LeagueTableEntityClientProps) => {
    const { data: seasons, loading, error } = useTableEntityData(leagueId)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-white">Loading seasons...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-red-500">Error: {error}</div>
            </div>
        )
    }

    if (!seasons || seasons.length === 0) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">
                    No tournament data available
                </div>
            </div>
        )
    }

    return (
        <div className="">
            <TableEntityLayout>
                <LeagueTableEntityContent
                    league={league}
                    standings={standings}
                    playerStats={playerStats}
                    tournamentName={tournamentName}
                    enrichedStandingsData={enrichedStandingsData}
                    enrichedGamesData={enrichedGamesData}
                    playerImages={playerImages}
                    matches={matches}
                    teamsData={teamsData}
                    teamImages={teamImages}
                    imageData={imageData}
                    seasons={seasons}
                />
            </TableEntityLayout>
        </div>
    )
}
