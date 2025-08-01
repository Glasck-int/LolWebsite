'use client'

import React from 'react'
import { StandingsHeader } from '../components/StandingsHeader'
import {
    Card,
    CardContext,
    CardBody,
    CardBodyMultiple,
    CardHeader,
    CardHeaderTab,
    CardHeaderContent,
    CardBodyMultipleContent,
    CardSort,
    CardHeaderBase,
} from '@/components/ui/card/index'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'
import { SortedRows } from '../utils/SortedRows'
import { useMatchesColumns, useGamesColumns, useCombinedStandingsColumns, getGridTemplate, getCombinedGridTemplate, getMobileColumns } from '../hooks/useStandingsColumns'
import { SortedMixedRows } from '../utils/SortedMixedRows'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { groupStandingsData } from '../utils/StandingsDataProcessor'
const desktopGridTemplate = getCombinedGridTemplate(false)
const tabletGridTemplate = getGridTemplate(false) // Tablette: grid complet avec Form
const mobileGridTemplate = getGridTemplate(true)

/**
 * Client-side standings component with combined matches and games statistics.
 *
 * Displays both BO/SERIE and GAMES statistics side by side in the same table.
 * Shows section headers to distinguish between matches stats and games stats.
 * Desktop version shows all columns, mobile version shows essential columns only.
 *
 * @param processedData - Processed standings data with team information and statistics
 * @param highlightedTeam - Optional team name to highlight in the standings
 * @param maxRows - Optional maximum number of rows to display (null for all rows)
 * @returns A standings component with combined statistics in one table
 *
 * @example
 * ```tsx
 * <StandingsWithTabsClient
 *   processedData={processedData}
 *   highlightedTeam="Team Liquid"
 *   maxRows={5}
 * />
 * ```
 */
export const StandingsWithTabsClient = ({
    processedData,
    highlightedTeam,
    maxRows,
}: {
    processedData: ProcessedStanding[]
    highlightedTeam?: string
    maxRows?: number | null
}) => {
    const t = useTranslate('Standings.tabs')
    
    // Check if we have groups first
    const groupedData = groupStandingsData(processedData)
    const hasGroups = groupedData !== null
    
    // Pre-generate columns at component level to avoid hooks in helper functions
    const defaultCombinedColumns = useCombinedStandingsColumns(true, undefined)
    const defaultMatchesColumns = useMatchesColumns({ sortable: true, groupName: undefined })
    const defaultGamesColumns = useGamesColumns({ sortable: true, groupName: undefined })
    
    // Helper function to get columns for a specific group (no hooks here)
    const getColumnsForGroup = () => {
        // For now, use default columns since we can't call hooks conditionally
        // This maintains functionality while fixing the hooks rule violation
        return {
            desktop: defaultCombinedColumns,
            tabletMatches: defaultMatchesColumns,
            tabletGames: defaultGamesColumns,
            mobileMatches: defaultMatchesColumns,
            mobileGames: defaultGamesColumns
        }
    }

    // If we have groups, render by groups
    if (hasGroups) {
        return (
            <Card className="flex flex-col w-full h-full">
                <CardContext>
                    <CardSort>
                        {/* Desktop: combined view with groups */}
                        <div className="hidden lg:block">
                            <CardBody>
                                <div className="flex flex-col w-full h-full">
                                    {/* Section headers for BO/SERIES and GAMES at the top */}
                                    <div
                                        className="w-full text-clear-grey bg-white/8"
                                        style={{ display: 'grid', gridTemplateColumns: desktopGridTemplate }}
                                    >
                                        <div></div> {/* Place column - empty */}
                                        <div></div> {/* Team column - empty */}
                                        <div></div> {/* J matches - empty */}
                                        <div className="flex items-center justify-center">
                                            <SubTitle className="whitespace-nowrap mb-2 mt-2">{t('matches')}</SubTitle>
                                        </div>
                                        <div></div> {/* L matches - empty */}
                                        <div></div> {/* WR matches - empty */}
                                        <div></div> {/* J games - empty */}
                                        <div className="flex items-center justify-center">
                                            <SubTitle className="whitespace-nowrap mb-2 mt-2">{t('games')}</SubTitle>
                                        </div>
                                        <div></div> {/* L games - empty */}
                                        <div></div> {/* WR games - empty */}
                                        <div></div> {/* Form column - empty */}
                                    </div>
                                    
                                    <div className="flex flex-col w-full h-full">
                                        {Object.entries(groupedData).map(([groupName, groupTeams]) => {
                                            const columns = getColumnsForGroup()
                                            
                                            return (
                                                <div key={groupName} className="flex flex-col">

                                                <CardHeader>
                                                    <CardHeaderBase>
                                                        <StandingsHeader
                                                            columns={columns.desktop}
                                                            gridTemplate={desktopGridTemplate}
                                                            className=""
                                                        />
                                                    </CardHeaderBase>
                                                </CardHeader>
                                                <SortedMixedRows
                                                    processedData={groupTeams}
                                                    columns={columns.desktop}
                                                    highlightedTeam={highlightedTeam}
                                                    maxRows={maxRows}
                                                    gridTemplate={desktopGridTemplate}
                                                    className=""
                                                />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </CardBody>
                        </div>

                        {/* Mobile + Tablet: Tabs with groups */}
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
                                    <CardBodyMultipleContent>
                                        <div className="flex flex-col w-full h-full ">
                                            {Object.entries(groupedData).map(([groupName, groupTeams]) => {
                                                const columns = getColumnsForGroup()
                                                const mobileMColumns = getMobileColumns(columns.mobileMatches)
                                                
                                                return (
                                                    <div key={groupName} className="flex flex-col">
                                                        {/* Group header */}
                                                        {/* <div className="mb-4">
                                                            <SubTitle className="text-lg font-semibold">
                                                                {groupTeams[0]?.groupInfo?.groupDisplay || groupName}
                                                            </SubTitle>
                                                        </div> */}
                                                        
                                                        <CardHeader>
                                                            <CardHeaderBase>
                                                                <div className="hidden md:block lg:hidden w-full">
                                                                    <StandingsHeader
                                                                        columns={columns.tabletMatches}
                                                                        gridTemplate={tabletGridTemplate}
                                                                        className="gap-2"
                                                                    />
                                                                </div>
                                                                <div className="md:hidden w-full">
                                                                    <StandingsHeader
                                                                        columns={mobileMColumns}
                                                                        gridTemplate={mobileGridTemplate}
                                                                        className="gap-2"
                                                                    />
                                                                </div>
                                                            </CardHeaderBase>
                                                        </CardHeader>
                                                        
                                                        <div className="hidden md:block lg:hidden">
                                                            <SortedRows
                                                                processedData={groupTeams}
                                                                columns={columns.tabletMatches}
                                                                highlightedTeam={highlightedTeam}
                                                                maxRows={maxRows}
                                                                gridTemplate={tabletGridTemplate}
                                                                className="gap-2"
                                                            />
                                                        </div>
                                                        <div className="md:hidden">
                                                            <SortedRows
                                                                processedData={groupTeams}
                                                                columns={mobileMColumns}
                                                                highlightedTeam={highlightedTeam}
                                                                maxRows={maxRows}
                                                                gridTemplate={mobileGridTemplate}
                                                                className="gap-2"
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardBodyMultipleContent>
                                    <CardBodyMultipleContent>
                                        <div className="flex flex-col w-full h-full">
                                            {Object.entries(groupedData).map(([groupName, groupTeams]) => {
                                                const columns = getColumnsForGroup()
                                                const mobileGColumns = getMobileColumns(columns.mobileGames)
                                                
                                                return (
                                                    <div key={groupName} className="flex flex-col">
                
                                                        
                                                        <CardHeader>
                                                            <CardHeaderBase>
                                                                <div className="hidden md:block lg:hidden w-full">
                                                                    <StandingsHeader
                                                                        columns={columns.tabletGames}
                                                                        gridTemplate={tabletGridTemplate}
                                                                        className="gap-2"
                                                                    />
                                                                </div>
                                                                <div className="md:hidden w-full">
                                                                    <StandingsHeader
                                                                        columns={mobileGColumns}
                                                                        gridTemplate={mobileGridTemplate}
                                                                        className="gap-2"
                                                                    />
                                                                </div>
                                                            </CardHeaderBase>
                                                        </CardHeader>
                                                        
                                                        <div className="hidden md:block lg:hidden">
                                                            <SortedRows
                                                                processedData={groupTeams}
                                                                columns={columns.tabletGames}
                                                                highlightedTeam={highlightedTeam}
                                                                maxRows={maxRows}
                                                                gridTemplate={tabletGridTemplate}
                                                                className="gap-2"
                                                            />
                                                        </div>
                                                        <div className="md:hidden">
                                                            <SortedRows
                                                                processedData={groupTeams}
                                                                columns={mobileGColumns}
                                                                highlightedTeam={highlightedTeam}
                                                                maxRows={maxRows}
                                                                gridTemplate={mobileGridTemplate}
                                                                className="gap-2"
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardBodyMultipleContent>
                                </CardBodyMultiple>
                            </CardBody>
                        </div>
                    </CardSort>
                </CardContext>
            </Card>
        )
    }

    // No groups - original layout
    const noGroupColumns = getColumnsForGroup()
    const noGroupMobileMColumns = getMobileColumns(noGroupColumns.mobileMatches)
    const noGroupMobileGColumns = getMobileColumns(noGroupColumns.mobileGames)
    
    return (
        <Card className="flex flex-col w-full h-full ">
            <CardContext>
                <CardSort>
                {/* Desktop: combined view with sections */}
                <div className="hidden lg:block">
                    <CardBody>
                        <div className="flex flex-col w-full h-full ">
                            {/* Section headers for BO/SERIES and GAMES */}
                            <div
                                className="w-full text-clear-grey bg-white/8"
                                style={{ display: 'grid', gridTemplateColumns: desktopGridTemplate }}
                            >
                                <div></div> {/* Place column - empty */}
                                <div></div> {/* Team column - empty */}
                                
                                <div></div> {/* J matches - empty */}
                                {/* BO/SERIES header between W and L - same style as tabs */}
                                <div className="flex items-center justify-center">
                                    <SubTitle className="whitespace-nowrap mb-2 mt-2">{t('matches')}</SubTitle>
                                </div>
                                <div></div> {/* L matches - empty */}
                                <div></div> {/* WR matches - empty */}
                                
                                <div></div> {/* J games - empty */}
                                {/* GAMES header between W and L - same style as tabs */}
                                <div className="flex items-center justify-center">
                                    <SubTitle className="whitespace-nowrap mb-2 mt-2">{t('games')}</SubTitle>
                                </div>
                                <div></div> {/* L games - empty */}
                                <div></div> {/* WR games - empty */}
                                
                                <div></div> {/* Form column - empty */}
                            </div>

                            <CardHeader>
                                <CardHeaderBase>
                                    <StandingsHeader
                                        columns={noGroupColumns.desktop}
                                        gridTemplate={desktopGridTemplate}
                                        className=""
                                    />
                                </CardHeaderBase>
                            </CardHeader>
                            <SortedMixedRows
                                processedData={processedData}
                                columns={noGroupColumns.desktop}
                                highlightedTeam={highlightedTeam}
                                maxRows={maxRows}
                                gridTemplate={desktopGridTemplate}
                                className=""
                            />
                        </div>
                    </CardBody>
                </div>

                {/* Mobile + Tablet: Tabs like before */}
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
                            <CardBodyMultipleContent>
                                <div className="flex flex-col w-full h-full">
                                    <CardHeader>
                                        <CardHeaderBase>
                                            {/* Tablette: colonnes complètes avec Form */}
                                            <div className="hidden md:block lg:hidden w-full">
                                                <StandingsHeader
                                                    columns={noGroupColumns.tabletMatches}
                                                    gridTemplate={tabletGridTemplate}
                                                    className="gap-2"
                                                />
                                            </div>
                                            {/* Mobile: colonnes filtrées sans Form */}
                                            <div className="md:hidden w-full">
                                                <StandingsHeader
                                                    columns={noGroupMobileMColumns}
                                                    gridTemplate={mobileGridTemplate}
                                                    className="gap-2"
                                                />
                                            </div>
                                        </CardHeaderBase>
                                    </CardHeader>
                                    
                                    {/* Tablette: colonnes complètes avec Form */}
                                    <div className="hidden md:block lg:hidden">
                                        <SortedRows
                                            processedData={processedData}
                                            columns={noGroupColumns.tabletMatches}
                                            highlightedTeam={highlightedTeam}
                                            maxRows={maxRows}
                                            gridTemplate={tabletGridTemplate}
                                            className="gap-2"
                                        />
                                    </div>
                                    {/* Mobile: colonnes filtrées sans Form */}
                                    <div className="md:hidden">
                                        <SortedRows
                                            processedData={processedData}
                                            columns={noGroupMobileMColumns}
                                            highlightedTeam={highlightedTeam}
                                            maxRows={maxRows}
                                            gridTemplate={mobileGridTemplate}
                                            className="gap-2"
                                        />
                                    </div>
                                </div>
                            </CardBodyMultipleContent>
                            <CardBodyMultipleContent>
                                <div className="flex flex-col w-full h-full">
                                    <CardHeader>
                                        <CardHeaderBase>
                                            {/* Tablette: colonnes complètes avec Form */}
                                            <div className="hidden md:block lg:hidden w-full">
                                                <StandingsHeader
                                                    columns={noGroupColumns.tabletGames}
                                                    gridTemplate={tabletGridTemplate}
                                                    className="gap-2"
                                                />
                                            </div>
                                            {/* Mobile: colonnes filtrées sans Form */}
                                            <div className="md:hidden w-full">
                                                <StandingsHeader
                                                    columns={noGroupMobileGColumns}
                                                    gridTemplate={mobileGridTemplate}
                                                    className="gap-2"
                                                />
                                            </div>
                                        </CardHeaderBase>
                                    </CardHeader>
                                    
                                    {/* Tablette: colonnes complètes avec Form */}
                                    <div className="hidden md:block lg:hidden">
                                        <SortedRows
                                            processedData={processedData}
                                            columns={noGroupColumns.tabletGames}
                                            highlightedTeam={highlightedTeam}
                                            maxRows={maxRows}
                                            gridTemplate={tabletGridTemplate}
                                            className="gap-2"
                                        />
                                    </div>
                                    {/* Mobile: colonnes filtrées sans Form */}
                                    <div className="md:hidden">
                                        <SortedRows
                                            processedData={processedData}
                                            columns={noGroupMobileGColumns}
                                            highlightedTeam={highlightedTeam}
                                            maxRows={maxRows}
                                            gridTemplate={mobileGridTemplate}
                                            className="gap-2"
                                        />
                                    </div>

                                </div>
                            </CardBodyMultipleContent>

                        </CardBodyMultiple>
                    </CardBody>
                </div>
                </CardSort>
            </CardContext>
        </Card>
    )
}
