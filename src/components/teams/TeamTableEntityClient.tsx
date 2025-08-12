'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
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
import { Team as TeamType, League as LeagueType } from '@/generated/prisma'
import { TeamWithLatestLeague } from '@/lib/types/team'

interface TeamTableEntityClientProps {
    teamName: string
    teamData?: TeamWithLatestLeague
    teamImage?: string
    leagueData?: LeagueType
    leagueImage?: string
}

const TeamTableEntityContent = ({
    teamName,
    seasons,
    teamData,
    teamImage,
    leagueData,
    leagueImage,
}: {
    teamName: string
    seasons: SeasonData[]
    teamData?: TeamWithLatestLeague
    teamImage?: string
    leagueData?: LeagueType
    leagueImage?: string
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

    // Use latestLeague from teamData if available, otherwise fall back to leagueData prop
    const currentLeagueData = teamData?.latestLeague || leagueData
    

    // Update league data based on selected tournament

    return (
        <>
            <Card>
                <CardContext>
                    <CardBody>
                        <div className="hidden md:flex p-[15px] h-[130px] gap-3 w-full items-center justify-center overflow-hidden">
                            {teamData ? (
                                <div className="flex flex-row gap-4 items-center w-full">
                                    <div className="flex-shrink-0">
                                        {teamImage ? (
                                            <Image
                                                src={teamImage}
                                                alt={teamData.name || ''}
                                                width={75}
                                                height={75}
                                                className="object-contain drop-shadow-lg"
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
                                            {teamData.name}
                                        </h1>
                                        <div className="flex items-center gap-3">
                                            {leagueImage ? (
                                                <Image
                                                    src={leagueImage}
                                                    alt={currentLeagueData?.name || ''}
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
                                                            d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V8C19 11.3137 16.3137 14 13 14H11C7.68629 14 5 11.3137 5 8V5Z"
                                                            fill="currentColor"
                                                            opacity="0.9"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                            <p className="text-clear-grey font-semibold m-0 leading-none truncate">
                                                {currentLeagueData ? 
                                                    (() => {
                                                        // Si le short existe et n'est pas le même que le nom, on l'utilise
                                                        if (currentLeagueData.short && currentLeagueData.short !== currentLeagueData.name) {
                                                            return currentLeagueData.short;
                                                        }
                                                        // Sinon on génère une abréviation
                                                        if (currentLeagueData.name) {
                                                            const words = currentLeagueData.name.split(' ');
                                                            if (words.length >= 2) {
                                                                // Prendre la première lettre de chaque mot
                                                                return words.map(word => word[0]).join('').slice(0, 2).toUpperCase();
                                                            } else {
                                                                // Si un seul mot, prendre les 2 premières lettres
                                                                return currentLeagueData.name.slice(0, 2).toUpperCase();
                                                            }
                                                        }
                                                        return '';
                                                    })()
                                                    : 'League'
                                                }
                                            </p>
                                        </div>
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
                                            {teamName}
                                        </h1>
                                        <p className="text-clear-grey font-semibold m-0 leading-none text-sm">
                                            Team Profile
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
    teamData,
    teamImage,
    leagueData,
    leagueImage,
}: TeamTableEntityClientProps) => {
    const { data: seasons, loading, error } = useTeamTableEntityData(teamName)
    
    // Hook pour mettre à jour les métadonnées dynamiquement selon le tournoi sélectionné
    // Use latestLeague from teamData if available, otherwise fall back to leagueData prop
    const currentLeagueDataForComponent = (teamData as TeamWithLatestLeague)?.latestLeague || leagueData
    // Pass league name if available and it's actually a league name, otherwise pass null to disable the hook
    const leagueNameForMetadata = (currentLeagueDataForComponent?.name && currentLeagueDataForComponent.name !== teamName) ? currentLeagueDataForComponent.name : null
    useDynamicTournamentMetadata(leagueNameForMetadata)

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
                    teamData={teamData}
                    teamImage={teamImage}
                    leagueData={leagueData}
                    leagueImage={leagueImage}
                />
            </TableEntityLayout>
        </div>
    )
}