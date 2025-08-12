'use client'

import React from 'react'
import { 
    Card, 
    CardContext, 
    CardBody, 
    CardBodyMultiple, 
    CardHeader, 
    CardHeaderTab, 
    CardHeaderContent, 
    CardBodyMultipleContent, 
    CardSort
} from '@/components/ui/card'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'
import { StandingsTable, CombinedStandingsTable } from './StandingsTable'
import { groupStandingsData } from '../utils/StandingsDataProcessor'

interface StandingsWithTabsProps {
    /** Processed standings data */
    processedData: ProcessedStanding[]
    /** Optional team name to highlight */
    highlightedTeam?: string
    /** Optional maximum number of rows to display */
    maxRows?: number | null
}

/**
 * Standings component with tabs that reproduces the exact visual style of the original.
 * Uses the Card structure and styling from the original system.
 */
export const StandingsWithTabs = ({
    processedData,
    highlightedTeam,
    maxRows
}: StandingsWithTabsProps) => {
    const t = useTranslate('Standings.tabs')
    
    // Check if we have groups
    const groupedData = groupStandingsData(processedData)
    const hasGroups = groupedData !== null

    // Desktop view - combined table with sections
    const DesktopView = () => (
        <div className="hidden lg:block">
            <CardBody>
                <div className="flex flex-col w-full h-full">
                    {hasGroups ? (
                        // Grouped data - show section headers only on first group
                        Object.entries(groupedData).map(([groupName, groupTeams], index) => {
                            const groupDisplayName = groupTeams[0]?.groupInfo?.groupDisplay || groupName
                            const isFirstGroup = index === 0
                            
                            return (
                                <div key={groupName} className="flex flex-col">
                                    <CombinedStandingsTable
                                        data={groupTeams}
                                        groupName={groupDisplayName}
                                        highlightedTeam={highlightedTeam}
                                        maxRows={maxRows}
                                        showSectionHeaders={isFirstGroup}
                                    />
                                </div>
                            )
                        })
                    ) : (
                        // No groups - show section headers
                        <CombinedStandingsTable
                            data={processedData}
                            highlightedTeam={highlightedTeam}
                            maxRows={maxRows}
                            showSectionHeaders={true}
                        />
                    )}
                </div>
            </CardBody>
        </div>
    )

    // Mobile/Tablet view - tabs
    const TabletMobileView = () => (
        <div className="lg:hidden">
            <CardHeader>
                <CardHeaderTab>
                    <CardHeaderContent>
                        <p className="text-inherit">{t('matches')}</p>
                    </CardHeaderContent>
                    <CardHeaderContent>
                        <p className="text-inherit">{t('games')}</p>
                    </CardHeaderContent>
                </CardHeaderTab>
            </CardHeader>
            <CardBody>
                <CardBodyMultiple>
                    {/* Matches Tab */}
                    <CardBodyMultipleContent>
                        <div className="flex flex-col w-full h-full">
                            {hasGroups ? (
                                Object.entries(groupedData).map(([groupName, groupTeams]) => {
                                    const groupDisplayName = groupTeams[0]?.groupInfo?.groupDisplay || groupName
                                    
                                    return (
                                        <div key={groupName} className="flex flex-col">
                                            <StandingsTable
                                                data={groupTeams}
                                                config={{
                                                    type: 'matches',
                                                    groupName: groupDisplayName,
                                                    includeForm: false,
                                                    sortable: true
                                                }}
                                                highlightedTeam={highlightedTeam}
                                                maxRows={maxRows}
                                                className="gap-2"
                                            />
                                        </div>
                                    )
                                })
                            ) : (
                                <StandingsTable
                                    data={processedData}
                                    config={{
                                        type: 'matches',
                                        includeForm: false,
                                        sortable: true
                                    }}
                                    highlightedTeam={highlightedTeam}
                                    maxRows={maxRows}
                                    className="gap-2"
                                />
                            )}
                        </div>
                    </CardBodyMultipleContent>

                    {/* Games Tab */}
                    <CardBodyMultipleContent>
                        <div className="flex flex-col w-full h-full">
                            {hasGroups ? (
                                Object.entries(groupedData).map(([groupName, groupTeams]) => {
                                    const groupDisplayName = groupTeams[0]?.groupInfo?.groupDisplay || groupName
                                    
                                    return (
                                        <div key={groupName} className="flex flex-col">
                                            <StandingsTable
                                                data={groupTeams}
                                                config={{
                                                    type: 'games',
                                                    groupName: groupDisplayName,
                                                    includeForm: false,
                                                    sortable: true
                                                }}
                                                highlightedTeam={highlightedTeam}
                                                maxRows={maxRows}
                                                className="gap-2"
                                            />
                                        </div>
                                    )
                                })
                            ) : (
                                <StandingsTable
                                    data={processedData}
                                    config={{
                                        type: 'games',
                                        includeForm: false,
                                        sortable: true
                                    }}
                                    highlightedTeam={highlightedTeam}
                                    maxRows={maxRows}
                                    className="gap-2"
                                />
                            )}
                        </div>
                    </CardBodyMultipleContent>
                </CardBodyMultiple>
            </CardBody>
        </div>
    )

    return (
        <Card className="flex flex-col w-full h-full">
            <CardContext>
                <CardSort>
                    <DesktopView />
                    <TabletMobileView />
                </CardSort>
            </CardContext>
        </Card>
    )
}