'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useTeamTableEntityData } from '@/hooks/useTeamTableEntityData'
import { useTableEntityStore, SeasonData } from '@/store/tableEntityStore'
import { useSimpleTabSync } from '@/hooks/useSimpleTabSync'
import { useTableUrlSync } from '@/hooks/useTableUrlSync'
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
import { PlayerStatisticsClient } from '@/components/leagues/components/PlayerStatisticsClient'
import { ChampionStatisticsClient } from '@/components/leagues/components/ChampionStatisticsClient'
import { NextMatchesFetch } from '@/components/leagues/Matches/NextMatchesFetch'
import { MatchesCalendar } from '@/components/leagues/Matches/MatchesCalendar'
import { TournamentContentFetch } from '@/components/leagues/Standings/views/TournamentContentFetch'
import { ButtonBar } from '@/components/ui/Button/ButtonBar'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { getTeamByName } from '@/lib/api/teams'
import { Team as TeamType } from '@/generated/prisma'

interface TeamTableEntityClientProps {
    teamName: string
}

const TeamTableEntityContent = ({
    teamName,
    seasons,
}: {
    teamName: string
    seasons: SeasonData[]
}) => {
    const { activeId } = useTableEntityStore()
    const selectedTournamentId = activeId.length > 0 ? activeId[0] : null
    const t = useTranslate('Tabs')
    
    // Initialize simple tab URL synchronization
    useSimpleTabSync()
    
    // Initialize season/split/tournament URL synchronization
    useTableUrlSync(seasons)
    
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

    // Team data state
    const [teamData, setTeamData] = useState<TeamType | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch team data
    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true)
                
                const teamDataResult = await getTeamByName(teamName)
                
                if (teamDataResult.data) {
                    setTeamData(teamDataResult.data)
                }
            } catch (error) {
                console.error('Error fetching team data:', error)
                setTeamData(null)
            } finally {
                setLoading(false)
            }
        }

        if (teamName) {
            fetchTeamData()
        }
    }, [teamName])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-white">Loading team data...</div>
            </div>
        )
    }

    return (
        <>
            <Card>
                <CardContext>
                    <CardBody>
                        <div className="hidden md:flex p-[15px] h-[130px] gap-3 w-[250px] items-center justify-center">
                            {teamData ? (
                                <div className="flex flex-col items-center gap-2">
                                    <h2 className="text-xl font-bold">{teamData.name}</h2>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        {teamData.short && <div>Short: {teamData.short}</div>}
                                        {teamData.region && <div>Region: {teamData.region}</div>}
                                        {teamData.location && <div>Location: {teamData.location}</div>}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <h2 className="text-xl font-bold">{teamName}</h2>
                                    <div className="text-sm text-muted-foreground">Team Profile</div>
                                </div>
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
                        <SmartCardFooterContentSync>
                            <p className="text-inherit">Profile</p>
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
                                        Matches
                                    </h3>
                                    <p>
                                        Select a tournament to see matches
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </TableEntityContent>
                <TableEntityContent>
                    <div className="space-y-4">
                        {selectedTournamentId ? (
                            <MatchesCalendar tournamentId={selectedTournamentId.toString()} />
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Matches Calendar
                                </h3>
                                <p>Select a tournament to see all matches</p>
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
                                    Tournament Details
                                </h3>
                                <p>Select a tournament to view detailed standings or playoff bracket</p>
                            </div>
                        )}
                    </div>
                </TableEntityContent>
                <TableEntityContent>
                    <div className="space-y-4">
                        {/* Team Profile Information */}
                        {teamData ? (
                            <div className="grid gap-6">
                                {/* Team Overview Card */}
                                <div className="bg-card rounded-lg p-6 border border-border">
                                    <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {teamData.name && (
                                            <div>
                                                <span className="text-muted-foreground">Team Name:</span>
                                                <span className="ml-2">{teamData.name}</span>
                                            </div>
                                        )}
                                        {teamData.short && (
                                            <div>
                                                <span className="text-muted-foreground">Short Name:</span>
                                                <span className="ml-2">{teamData.short}</span>
                                            </div>
                                        )}
                                        {teamData.region && (
                                            <div>
                                                <span className="text-muted-foreground">Region:</span>
                                                <span className="ml-2">{teamData.region}</span>
                                            </div>
                                        )}
                                        {teamData.location && (
                                            <div>
                                                <span className="text-muted-foreground">Location:</span>
                                                <span className="ml-2">{teamData.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Social Media Links */}
                                {(teamData.twitter || teamData.instagram || teamData.youtube || teamData.subreddit || teamData.vk) && (
                                    <div className="bg-card rounded-lg p-6 border border-border">
                                        <h2 className="text-xl font-semibold mb-4">Social Media</h2>
                                        <div className="flex flex-wrap gap-4">
                                            {teamData.twitter && (
                                                <a href={`https://twitter.com/${teamData.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    Twitter
                                                </a>
                                            )}
                                            {teamData.instagram && (
                                                <a href={`https://instagram.com/${teamData.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
                                                    Instagram
                                                </a>
                                            )}
                                            {teamData.youtube && (
                                                <a href={teamData.youtube} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">
                                                    YouTube
                                                </a>
                                            )}
                                            {teamData.subreddit && (
                                                <a href={`https://reddit.com/r/${teamData.subreddit}`} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                                                    Subreddit
                                                </a>
                                            )}
                                            {teamData.vk && (
                                                <a href={teamData.vk} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    VK
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Team Profile
                                </h3>
                                <p>Team information not available</p>
                            </div>
                        )}
                    </div>
                </TableEntityContent>
            </TableEntityBody>
        </>
    )
}

export const TeamTableEntityClient = ({
    teamName,
}: TeamTableEntityClientProps) => {
    const { data: seasons, loading, error } = useTeamTableEntityData(teamName)
    
    // Hook pour mettre à jour les métadonnées dynamiquement selon le tournoi sélectionné
    useDynamicTournamentMetadata(teamName)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-white">Loading tournaments...</div>
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
                    No tournament data available for this team
                </div>
            </div>
        )
    }

    return (
        <div className="">
            <TableEntityLayout>
                <TeamTableEntityContent
                    teamName={teamName}
                    seasons={seasons}
                />
            </TableEntityLayout>
        </div>
    )
}