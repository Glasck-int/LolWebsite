'use client'

import React, { useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
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
import { PlayerWithRedirects } from '@glasck-int/glasck-types'
import { useTournamentPlayerTeam } from '@/hooks/useTournamentPlayerTeam'
import { useTeamImage } from '@/hooks/useTeamImage'
import { getPlayerImage, getPlayerTournamentImage } from '@/lib/api/player'
import { getTournamentPlayerStats } from '@/lib/api/players'
import { getTeamByName } from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'
import Image from 'next/image'

interface PlayerTableEntityClientProps {
    playerName: string
    playerData?: PlayerWithRedirects
    playerImage?: string
}

const PlayerTableEntityContent = ({
    playerName,
    seasons,
    playerData,
    playerImage,
}: {
    playerName: string
    seasons: SeasonData[]
    playerData?: PlayerWithRedirects
    playerImage?: string
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

    // Player data from server-side props

    // State for team data when we need to fetch it by name (fallback case)
    const [fallbackTeamData, setFallbackTeamData] = useState<{ name: string; overviewPage?: string; image?: string } | null>(null)

    // Get team data for the selected tournament dynamically
    const { teamData: tournamentTeamData } = useTournamentPlayerTeam(selectedTournamentId, playerName)
    
    // Priority: tournament-specific team > fallback team with overviewPage > player's current team from API
    const currentTeamData = tournamentTeamData || fallbackTeamData || (playerData ? { name: playerData.team || '', overviewPage: undefined, image: undefined } : null)
    
    // State for team image URL
    const [teamImageUrl, setTeamImageUrl] = useState<string | null>(null)
    const [, setTeamImageLoading] = useState(false)
    
    // Fetch team image when team data changes
    useEffect(() => {
        if (!currentTeamData?.image) {
            setTeamImageUrl(null)
            return
        }
        
        const fetchTeamImage = async () => {
            setTeamImageLoading(true)
            try {
                const imageResult = await getTeamImage(currentTeamData.image!.replace('.png', '.webp'))
                setTeamImageUrl(imageResult.data || null)
            } catch (error) {
                console.error('Failed to fetch team image:', error)
                setTeamImageUrl(null)
            } finally {
                setTeamImageLoading(false)
            }
        }
        
        fetchTeamImage()
    }, [currentTeamData?.image])
    
    // Use team image from API if available, otherwise use hook if we have overviewPage
    const { teamImage: dynamicTeamImage } = useTeamImage(
        currentTeamData?.image ? null : currentTeamData?.overviewPage
    )
    
    // Use team image URL from direct fetch or dynamic fetch from overviewPage
    const currentTeamImage = teamImageUrl || dynamicTeamImage

    // State for player image loaded dynamically with tournament context
    const [dynamicPlayerImage, setDynamicPlayerImage] = useState<string | null>(null)
    const [, setPlayerImageLoading] = useState(false)

    // Use dynamic player image from client-side fetch or server-side prop fallback
    const currentPlayerImage = dynamicPlayerImage || playerImage

    // Fetch player image when tournament or player changes
    useEffect(() => {
        if (!selectedTournamentId || !playerName) {
            setDynamicPlayerImage(null)
            return
        }

        const fetchPlayerImage = async () => {
            setPlayerImageLoading(true)
            try {
                // First get tournament data to get tournament name
                const response = await getTournamentPlayerStats(selectedTournamentId.toString())
                
                if (response.data && response.data.tournament) {
                    // Use the new tournament-specific image API
                    console.log(`🔍 [PLAYER COMPONENT] Starting intelligent image search for ${playerName} in ${response.data.tournament}`)
                    const imageResponse = await getPlayerTournamentImage(playerName, response.data.tournament)
                    if (imageResponse.data) {
                        setDynamicPlayerImage(imageResponse.data)
                        console.log(`🎯 [PLAYER COMPONENT] Successfully applied intelligent image for ${playerName}`)
                    } else {
                        // Fallback to the old method if new API doesn't find anything
                        console.log(`⚠️ [PLAYER COMPONENT] Intelligent search failed, trying legacy fallback for ${playerName}...`)
                        const fallbackResponse = await getPlayerImage(playerName, response.data.tournament)
                        if (fallbackResponse.data) {
                            setDynamicPlayerImage(fallbackResponse.data)
                            console.log(`✅ [PLAYER COMPONENT] Applied legacy fallback image for ${playerName}`)
                        } else {
                            setDynamicPlayerImage(null)
                            console.log(`❌ [PLAYER COMPONENT] No image found anywhere for ${playerName} in ${response.data.tournament}`)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch player image:', error)
                setDynamicPlayerImage(null)
            } finally {
                setPlayerImageLoading(false)
            }
        }

        fetchPlayerImage()
    }, [selectedTournamentId, playerName])

    // Fetch complete team data when we only have team name but no overviewPage
    useEffect(() => {
        const needsFallbackTeamData = !tournamentTeamData && playerData?.team && !fallbackTeamData
        
        if (!needsFallbackTeamData) {
            return
        }

        const fetchTeamData = async () => {
            try {
                console.log(`🔄 [PLAYER COMPONENT] Fetching complete team data for: ${playerData.team}`)
                const teamResult = await getTeamByName(playerData.team!)
                
                if (teamResult.data) {
                    setFallbackTeamData({
                        name: teamResult.data.name || playerData.team!,
                        overviewPage: teamResult.data.overviewPage || undefined,
                        image: teamResult.data.image || undefined
                    })
                    console.log(`✅ [PLAYER COMPONENT] Fetched team data - overviewPage: ${teamResult.data.overviewPage || 'N/A'}`)
                } else {
                    console.log(`⚠️ [PLAYER COMPONENT] No team data found for: ${playerData.team}`)
                    setFallbackTeamData(null)
                }
            } catch (error) {
                console.error('Failed to fetch team data:', error)
                setFallbackTeamData(null)
            }
        }

        fetchTeamData()
    }, [tournamentTeamData, playerData?.team, fallbackTeamData])


    return (
        <>
            <Card>
                <CardContext>
                    <CardBody>
                        <div className="hidden md:flex p-[15px] h-[130px] gap-3 w-full items-center justify-center overflow-hidden">
                            {playerData ? (
                                <div className="flex flex-row gap-4 items-center w-full">
                                    <div className="flex-shrink-0">
                                        {currentPlayerImage ? (
                                            <Image
                                                src={currentPlayerImage}
                                                alt={playerData.name || playerName}
                                                width={75}
                                                height={75}
                                                className="object-contain drop-shadow-lg rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-[75px] h-[75px] rounded-lg bg-gradient-to-br from-dark-grey to-clear-violet/30 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
                                                <svg
                                                    width="40"
                                                    height="40"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="text-white"
                                                >
                                                    <path
                                                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                                        fill="currentColor"
                                                        opacity="0.9"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center items-start gap-0 min-w-0 flex-1">
                                        <h1 className="font-medium m-0 leading-none truncate w-full">
                                            {playerData.name}
                                        </h1>
                                        {currentTeamData?.name ? (
                                            <Link 
                                                href={`/teams/${currentTeamData.name}`}
                                                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                            >
                                                {currentTeamImage ? (
                                                    <Image
                                                        src={currentTeamImage}
                                                        alt={currentTeamData?.name || ''}
                                                        width={34}
                                                        height={34}
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded bg-gradient-to-br from-dark-grey to-clear-violet/30 flex items-center justify-center flex-shrink-0">
                                                        <svg
                                                            width="12"
                                                            height="12"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="text-white"
                                                        >
                                                            <path
                                                                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                                                fill="currentColor"
                                                                opacity="0.9"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                                <p className="text-clear-grey font-semibold m-0 leading-none truncate">
                                                    {(() => {
                                                        // Si l'équipe a un nom
                                                        if (currentTeamData.name) {
                                                            const words = currentTeamData.name.split(' ');
                                                            if (words.length >= 2) {
                                                                // Prendre la première lettre de chaque mot
                                                                return words.map(word => word[0]).join('').slice(0, 3).toUpperCase();
                                                            } else {
                                                                // Si un seul mot, prendre les 3 premières lettres
                                                                return currentTeamData.name.slice(0, 3).toUpperCase();
                                                            }
                                                        }
                                                        return '';
                                                    })()}
                                                </p>
                                            </Link>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-gradient-to-br from-dark-grey to-clear-violet/30 flex items-center justify-center flex-shrink-0">
                                                    <svg
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="text-white"
                                                    >
                                                        <path
                                                            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                                            fill="currentColor"
                                                            opacity="0.9"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-clear-grey font-semibold m-0 leading-none truncate">
                                                    Team
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-row gap-4 items-center">
                                    <div className="w-[75px] h-[75px] rounded-lg bg-gradient-to-br from-dark-grey to-clear-violet/30 flex items-center justify-center flex-shrink-0 ring-1 ring-white/10">
                                        <svg
                                            width="40"
                                            height="40"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="text-white"
                                        >
                                            <path
                                                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                                fill="currentColor"
                                                opacity="0.9"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col justify-center items-start gap-2">
                                        <h1 className="font-medium text-xl m-0 leading-none">
                                            {playerName}
                                        </h1>
                                        <p className="text-clear-grey font-semibold m-0 leading-none text-sm">
                                            Player Profile
                                        </p>
                                    </div>
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
    playerData,
    playerImage,
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
                    playerData={playerData}
                    playerImage={playerImage}
                />
            </TableEntityLayout>
        </div>
    )
}