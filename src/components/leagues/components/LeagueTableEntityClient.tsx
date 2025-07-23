'use client'

import React from 'react'
import { useTableEntityData } from '@/hooks/useTableEntityData'
import {
    TableEntityLayout,
    TableEntityHeader,
    TableEntityBody,
    TableEntityContent,
    useLayout,
} from '@/components/layout/TableEntityLayout/TableEntityLayout'
import {
    Card,
    CardBody,
    CardFooter,
    CardFooterContent,
} from '@/components/ui/card'
import {
    LeagueDescription,
    NextMatches,
    NextMatchesClient,
    StandingsOverviewClient,
    StandingsWithTabsClient,
} from '@/components/leagues'
import { League, Standings, MatchSchedule, MatchScheduleGame } from '@/generated/prisma'
import { ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'

interface LeagueTableEntityClientProps {
    leagueId: number
    league?: League
    standings?: Standings[]
    playerStats?: any
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

const LeagueTableEntityContent = ({
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
    seasons,
}: Omit<LeagueTableEntityClientProps, 'leagueId'> & { seasons: any[] }) => {
    const { activeSplit, activeTournament, activeId } = useLayout()

    console.log('activeSplit', activeSplit)
    console.log('activeTournament', activeTournament)
    console.log('activeId', activeId)

    return (
        <>
            <Card>
                <CardBody>
                    <div className="hidden md:flex p-[15px] h-[130px] gap-3 w-[250px]">
                        {league && imageData && (
                            <LeagueDescription
                                league={league}
                                imageData={imageData}
                            />
                        )}
                    </div>
                    <TableEntityHeader seasons={seasons} all={[]} />
                </CardBody>
                <CardFooter>
                    <CardFooterContent>
                        <p className="text-inherit">Aperçu</p>
                    </CardFooterContent>
                    <CardFooterContent>
                        <p className="text-inherit">Matchs</p>
                    </CardFooterContent>
                    <CardFooterContent>
                        <p className="text-inherit">Statistiques</p>
                    </CardFooterContent>
                    <CardFooterContent>
                        <p className="text-inherit">Tournois</p>
                    </CardFooterContent>
                </CardFooter>
            </Card>
            {/* Body avec le contenu des différents onglets */}
            <TableEntityBody>
                <TableEntityContent>
                    <div className="space-y-4">
                        {/* Standings Overview */}
                        {standings &&
                        playerStats &&
                        tournamentName &&
                        enrichedStandingsData &&
                        enrichedGamesData &&
                        playerImages ? (
                            <StandingsOverviewClient
                                processedData={enrichedStandingsData}
                                maxRows={3}
                            />
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Aperçu
                                </h3>
                                <p>Chargement des données...</p>
                            </div>
                        )}
                    </div>
                </TableEntityContent>
                <TableEntityContent>
                    <div className="space-y-4">
                        {/* Next Matches */}
                        {matches ? (
                            <NextMatches
                                tournamentId={5165}
                                showSingleMatchOnDesktop={true}
                                lastMatches={false}
                            />
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Matchs
                                </h3>
                                <p>Chargement des matchs...</p>
                            </div>
                        )}
                    </div>
                </TableEntityContent>
                <TableEntityContent></TableEntityContent>
                <TableEntityContent>
                    <div className="space-y-4">
                        {/* Players KDA et Standings With Tabs */}
                        {standings &&
                        playerStats &&
                        tournamentName &&
                        enrichedStandingsData &&
                        enrichedGamesData &&
                        playerImages ? (
                            <StandingsWithTabsClient
                                processedData={enrichedStandingsData}
                                maxRows={null}
                            />
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Statistiques
                                </h3>
                                <p>Chargement des statistiques...</p>
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
