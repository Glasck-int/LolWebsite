'use client'

import React from 'react'
import { StandingsHeader } from '../components/StandingsHeader'
import {
    Card,
    CardBody,
    CardBodyMultiple,
    CardHeader,
    CardHeaderTab,
    CardHeaderContent,
    CardBodyMultipleContent,
    CardSort,
    CardHeaderBase,
} from '@/components/ui/card/index'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'
import { SortedRows } from '../utils/SortedRows'
import { useMatchesColumns, useGamesColumns, useCombinedStandingsColumns, getGridTemplate, getCombinedGridTemplate, getMobileColumns } from '../hooks/useStandingsColumns'
import { SortedMixedRows } from '../utils/SortedMixedRows'
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
    // Desktop: combined columns, Tablet + Mobile: tabs
    const desktopColumns = useCombinedStandingsColumns(true)
    const tabletMatchesColumns = useMatchesColumns({ sortable: true })
    const tabletGamesColumns = useGamesColumns({ sortable: true })
    const mobileMatchesColumns = useMatchesColumns({ sortable: true })
    const mobileGamesColumns = useGamesColumns({ sortable: true })
    const mobileMColumns = getMobileColumns(mobileMatchesColumns)
    const mobileGColumns = getMobileColumns(mobileGamesColumns)

    return (
        <Card className="flex flex-col w-full h-full ">
            <CardSort>
                {/* Desktop: combined view with sections */}
                <div className="hidden lg:block">
                    <CardBody>
                        <div className="flex flex-col w-full h-full">
                            {/* Section headers for BO/SERIES and GAMES */}
                            <div className="w-full text-clear-grey" style={{ display: 'grid', gridTemplateColumns: desktopGridTemplate }}>
                                <div></div> {/* Place column - empty */}
                                <div></div> {/* Team column - empty */}
                                
                                <div></div> {/* J matches - empty */}
                                {/* BO/SERIES header between W and L - same style as tabs */}
                                <div className="flex items-center justify-center">
                                    <p className="text-clear-grey whitespace-nowrap font-medium mb-2 mt-2">BO/SERIES</p>
                                </div>
                                <div></div> {/* L matches - empty */}
                                <div></div> {/* WR matches - empty */}
                                
                                <div></div> {/* J games - empty */}
                                {/* GAMES header between W and L - same style as tabs */}
                                <div className="flex items-center justify-center">
                                    <p className="text-clear-grey whitespace-nowrap font-medium mb-2 mt-2">GAMES</p>
                                </div>
                                <div></div> {/* L games - empty */}
                                <div></div> {/* WR games - empty */}
                                
                                <div></div> {/* Form column - empty */}
                            </div>

                            <CardHeader>
                                <CardHeaderBase>
                                    <StandingsHeader
                                        columns={desktopColumns}
                                        gridTemplate={desktopGridTemplate}
                                        className=""
                                    />
                                </CardHeaderBase>
                            </CardHeader>
                            <SortedMixedRows
                                processedData={processedData}
                                columns={desktopColumns}
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
                                <p className="text-inherit">BO/SERIE</p>
                            </CardHeaderContent>
                            <CardHeaderContent>
                                <p className="text-inherit">GAMES</p>
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
                                                    columns={tabletMatchesColumns}
                                                    gridTemplate={tabletGridTemplate}
                                                    className="gap-2"
                                                />
                                            </div>
                                            {/* Mobile: colonnes filtrées sans Form */}
                                            <div className="md:hidden w-full">
                                                <StandingsHeader
                                                    columns={mobileMColumns}
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
                                            columns={tabletMatchesColumns}
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
                                            columns={mobileMColumns}
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
                                                    columns={tabletGamesColumns}
                                                    gridTemplate={tabletGridTemplate}
                                                    className="gap-2"
                                                />
                                            </div>
                                            {/* Mobile: colonnes filtrées sans Form */}
                                            <div className="md:hidden w-full">
                                                <StandingsHeader
                                                    columns={mobileGColumns}
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
                                            columns={tabletGamesColumns}
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
                                            columns={mobileGColumns}
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
        </Card>
    )
}
