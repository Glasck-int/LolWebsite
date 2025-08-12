'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { usePlayerTableEntityData } from '@/hooks/usePlayerTableEntityData'
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
import { getPlayerByLink, getPlayerByOverviewPage } from '@/lib/api/player'
import { PlayerWithRedirects } from '@glasck-int/glasck-types'

interface PlayerTableEntityClientProps {
    playerName: string
}

const PlayerTableEntityContent = ({
    playerName,
    seasons,
}: {
    playerName: string
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

    // Player data state
    const [playerData, setPlayerData] = useState<PlayerWithRedirects | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch player data
    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                setLoading(true)
                
                // First, search for the player to get the overviewPage
                const searchResult = await getPlayerByLink(playerName)
                
                if (!searchResult.data || searchResult.data.length === 0) {
                    setPlayerData(null)
                    return
                }
                
                // Get the overviewPage from the first result
                const overviewPage = searchResult.data[0].overviewPage
                
                // Now get the complete player data
                const playerDataResult = await getPlayerByOverviewPage(overviewPage)
                
                if (playerDataResult.data) {
                    setPlayerData(playerDataResult.data)
                }
            } catch (error) {
                console.error('Error fetching player data:', error)
                setPlayerData(null)
            } finally {
                setLoading(false)
            }
        }

        if (playerName) {
            fetchPlayerData()
        }
    }, [playerName])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="text-white">Loading player data...</div>
            </div>
        )
    }

    return (
        <>
            <Card>
                <CardContext>
                    <CardBody>
                        <div className="hidden md:flex p-[15px] h-[130px] gap-3 w-full items-center justify-center">
                            {playerData ? (
                                <div className="flex flex-col items-center gap-2">
                                    <h2 className="text-xl font-bold">{playerData.name}</h2>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        {playerData.team && <div>Team: {playerData.team}</div>}
                                        {playerData.role && <div>Role: {playerData.role}</div>}
                                        {playerData.country && <div>Country: {playerData.country}</div>}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <h2 className="text-xl font-bold">{playerName}</h2>
                                    <div className="text-sm text-muted-foreground">Player Profile</div>
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
                        {/* Player Profile Information */}
                        {playerData ? (
                            <div className="grid gap-6">
                                {/* Player Overview Card */}
                                <div className="bg-card rounded-lg p-6 border border-border">
                                    <h2 className="text-xl font-semibold mb-4">Player Overview</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {playerData.nameFull && (
                                            <div>
                                                <span className="text-muted-foreground">Full Name:</span>
                                                <span className="ml-2">{playerData.nameFull}</span>
                                            </div>
                                        )}
                                        {playerData.country && (
                                            <div>
                                                <span className="text-muted-foreground">Country:</span>
                                                <span className="ml-2">{playerData.country}</span>
                                            </div>
                                        )}
                                        {playerData.role && (
                                            <div>
                                                <span className="text-muted-foreground">Role:</span>
                                                <span className="ml-2">{playerData.role}</span>
                                            </div>
                                        )}
                                        {playerData.team && (
                                            <div>
                                                <span className="text-muted-foreground">Current Team:</span>
                                                <span className="ml-2">{playerData.team}</span>
                                            </div>
                                        )}
                                        {playerData.age && (
                                            <div>
                                                <span className="text-muted-foreground">Age:</span>
                                                <span className="ml-2">{playerData.age}</span>
                                            </div>
                                        )}
                                        {playerData.residency && (
                                            <div>
                                                <span className="text-muted-foreground">Residency:</span>
                                                <span className="ml-2">{playerData.residency}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Social Media Links */}
                                {(playerData.twitter || playerData.instagram || playerData.stream || playerData.youtube) && (
                                    <div className="bg-card rounded-lg p-6 border border-border">
                                        <h2 className="text-xl font-semibold mb-4">Social Media</h2>
                                        <div className="flex flex-wrap gap-4">
                                            {playerData.twitter && (
                                                <a href={`https://twitter.com/${playerData.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    Twitter
                                                </a>
                                            )}
                                            {playerData.instagram && (
                                                <a href={`https://instagram.com/${playerData.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
                                                    Instagram
                                                </a>
                                            )}
                                            {playerData.stream && (
                                                <a href={playerData.stream} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
                                                    Stream
                                                </a>
                                            )}
                                            {playerData.youtube && (
                                                <a href={playerData.youtube} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">
                                                    YouTube
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Favorite Champions */}
                                {playerData.favChamps && playerData.favChamps.length > 0 && (
                                    <div className="bg-card rounded-lg p-6 border border-border">
                                        <h2 className="text-xl font-semibold mb-4">Favorite Champions</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {playerData.favChamps.map((champ: string, index: number) => (
                                                <span key={index} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                                                    {champ}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">
                                    Player Profile
                                </h3>
                                <p>Player information not available</p>
                            </div>
                        )}
                    </div>
                </TableEntityContent>
            </TableEntityBody>
        </>
    )
}

export const PlayerTableEntityClient = ({
    playerName,
}: PlayerTableEntityClientProps) => {
    const { data: seasons, loading, error } = usePlayerTableEntityData(playerName)
    
    // Hook pour mettre à jour les métadonnées dynamiquement selon le tournoi sélectionné
    useDynamicTournamentMetadata(playerName)

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
                    No tournament data available for this player
                </div>
            </div>
        )
    }

    return (
        <div className="">
            <TableEntityLayout>
                <PlayerTableEntityContent
                    playerName={playerName}
                    seasons={seasons}
                />
            </TableEntityLayout>
        </div>
    )
}