'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useTableEntityData } from '@/hooks/useTableEntityData'
import { useTableEntityStore, SeasonData } from '@/store/tableEntityStore'
import { useSimpleTabSync } from '@/hooks/useSimpleTabSync'
import { useSimpleEntityInit } from '@/hooks/useSimpleEntityInit'
import { useUrlSync } from '@/hooks/useUrlSync'
import { useUrlStateValidator } from '@/hooks/useUrlStateValidator'
import { useDynamicTournamentMetadata } from '@/hooks/useDynamicTournamentMetadata'
import {
    TableEntityLayout,
    TableEntityHeader,
    TableEntityBody,
    TableEntityContent,
} from '@/components/layout/TableEntityLayout/TableEntityLayout'
import {
    Card,
    CardBody,
    CardContext,
} from '@/components/ui/card'
import { SmartCardFooterSync, SmartCardFooterContentSync } from '@/components/ui/SmartTabsSync'
import {
    LeagueDescription,
    StandingsOverviewFetch,
} from '@/components/leagues'
import { NextMatchesFetch } from '@/components/leagues/Matches/NextMatchesFetch'
import { MatchesCalendar } from '@/components/leagues/Matches/MatchesCalendar'
import { ChampionStatisticsClient } from './ChampionStatisticsClient'
import { PlayerStatisticsClient } from './PlayerStatisticsClient'
import { ButtonBar } from '@/components/ui/Button/ButtonBar'
import { TournamentContentFetch } from '@/components/leagues/Standings/views/TournamentContentFetch'
import {
    League,
    Standings,
    MatchSchedule,
    MatchScheduleGame,
} from '@/generated/prisma'
import { ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'
import { useTranslate } from '@/lib/hooks/useTranslate'

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
    initialSeason?: string
    initialSplit?: string
    initialTournament?: string
}

const LeagueTableEntityContent = ({
    league,
    imageData,
    seasons,
    initialSeason,
    initialSplit,
    initialTournament,
}: Omit<LeagueTableEntityClientProps, 'leagueId'> & {
    seasons: SeasonData[]
}) => {
    const { activeId } = useTableEntityStore()
    const selectedTournamentId = activeId.length > 0 ? activeId[0] : null
    const t = useTranslate('Tabs')
    
    // Initialize simple tab URL synchronization
    useSimpleTabSync()
    
    // Initialize season/split/tournament from URL parameters (no navigation interference)
    const { isInitializing } = useSimpleEntityInit(seasons, initialSeason, initialSplit, initialTournament)
    
    // Sync URL when selections change (after initialization)
    useUrlSync(isInitializing)
    
    // Validate and correct URL state inconsistencies
    useUrlStateValidator()
    
    // State for managing which statistics to show
    const [activeStatsView, setActiveStatsView] = useState<string | null>('Players')
    
    const handleStatsViewChange = useCallback((option: string | null) => {
        setActiveStatsView(option)
    }, [])
    
    // Reset stats view to Players when selectedTournamentId changes
    useEffect(() => {
        if (selectedTournamentId) {
            setActiveStatsView('Players')
        }
    }, [selectedTournamentId])

    return (
        <>
            <Card>
                <CardContext>
                    <CardBody>
                    <div className="hidden md:flex p-[15px] h-[130px] gap-3 w-full items-center justify-left">
                        {league && (
                            <LeagueDescription
                                league={league}
                                imageData={imageData || ''}
                            />
                        )}
                    </div>
                    <TableEntityHeader seasons={seasons} />
                </CardBody>
                <SmartCardFooterSync>
                    <SmartCardFooterContentSync>
                        <p className="text-inherit">{t('Overview')}</p>
                    </SmartCardFooterContentSync>
                    <SmartCardFooterContentSync>
                        <p className="text-inherit">{t('Matches')}</p>
                    </SmartCardFooterContentSync>
                    <SmartCardFooterContentSync>
                        <p className="text-inherit">{t('Statistics')}</p>
                    </SmartCardFooterContentSync>
                    <SmartCardFooterContentSync>
                        <p className="text-inherit">{t('Tournaments')}</p>
                    </SmartCardFooterContentSync>
                </SmartCardFooterSync>
                </CardContext>
            </Card>
            {/* Body avec le contenu des différents onglets */}
            <TableEntityBody>
                <TableEntityContent>
                    <div className="space-y-4">
                        <div className="space-y-4">
                            {/* Next Matches */}
                            {selectedTournamentId ? (
                                <NextMatchesFetch
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
                        {selectedTournamentId ? (
                            <MatchesCalendar tournamentId={selectedTournamentId.toString()} />
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Matchs
                                </h3>
                                <p>Sélectionnez un tournoi pour voir les matchs</p>
                            </div>
                        )}
                    </div>
                </TableEntityContent>
                <TableEntityContent>
                    <div className="space-y-4">
                        {selectedTournamentId ? (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <ButtonBar 
                                            key={`buttonbar-${selectedTournamentId}-${activeStatsView}`}
                                            options={['Players', 'Champions']}
                                            onButtonChange={handleStatsViewChange}
                                            defaultActiveIndex={activeStatsView === 'Players' ? 0 : activeStatsView === 'Champions' ? 1 : 0}
                                        />
                                    </div>
                                    
                                    
                                    {activeStatsView === 'Players' && (
                                        <div>
                                            <PlayerStatisticsClient tournamentId={selectedTournamentId.toString()} />
                                        </div>
                                    )}
                                    
                                    {activeStatsView === 'Champions' && (
                                        <div>
                                            <ChampionStatisticsClient tournamentId={selectedTournamentId.toString()} />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Statistics
                                </h3>
                                <p>Select a tournament to view player and champion statistics</p>
                            </div>
                        )}
                    </div>
                </TableEntityContent>
                <TableEntityContent>
                    <div className="space-y-4">
                        {/* Tournament content - automatically detects standings vs playoff bracket */}
                        {selectedTournamentId ? (
                            <TournamentContentFetch
                                key={`tournament-content-${selectedTournamentId}`}
                                tournamentId={selectedTournamentId}
                                maxRows={null}
                            />
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Statistiques
                                </h3>
                                <p>Sélectionnez un tournoi pour voir les statistiques détaillées</p>
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
    imageData,
    initialSeason,
    initialSplit,
    initialTournament,
}: LeagueTableEntityClientProps) => {
    const { data: seasons, loading, error } = useTableEntityData(leagueId)
    
    // Hook pour mettre à jour les métadonnées dynamiquement selon le tournoi sélectionné
    useDynamicTournamentMetadata(league?.name || '')

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
                    imageData={imageData}
                    seasons={seasons}
                    initialSeason={initialSeason}
                    initialSplit={initialSplit}
                    initialTournament={initialTournament}
                />
            </TableEntityLayout>
        </div>
    )
}
