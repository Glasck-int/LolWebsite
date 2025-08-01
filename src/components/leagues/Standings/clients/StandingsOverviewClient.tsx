'use client'

import React from 'react'
import { StandingsHeader } from '../components/StandingsHeader'
import {
    Card,
    CardBody,
    CardHeader,
    CardSort,
    CardHeaderBase,
    CardContext,
} from '@/components/ui/card/index'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'
import { SortedRows } from '../utils/SortedRows'
import { useMatchesColumns, getGridTemplate, getMobileColumns } from '../hooks/useStandingsColumns'

/**
 * Client-side standings overview component.
 *
 * Handles the rendering of standings data with translations and client-side interactions.
 * This component is responsible for the UI rendering while the parent handles data fetching.
 * Uses the same structure as StandingsWithTabsClient but without sorting functionality.
 *
 * @param processedData - Processed standings data with team information and statistics
 * @param highlightedTeam - Optional team name to highlight in the standings
 * @param maxRows - Optional maximum number of rows to display (null for all rows)
 * @returns A complete standings table component with team data and statistics
 *
 * @example
 * ```tsx
 * <StandingsOverviewClient
 *   processedData={processedData}
 *   highlightedTeam="Team Liquid"
 *   maxRows={5}
 * />
 * ```
 */
export const StandingsOverviewClient = ({
    processedData,
    highlightedTeam,
    maxRows,
}: {
    processedData: ProcessedStanding[]
    highlightedTeam?: string
    maxRows?: number | null
}) => {
    const columns = useMatchesColumns({ sortable: false })
    const mobileColumns = getMobileColumns(columns)

    const gridTemplate = getGridTemplate(false)
    const gridTemplateMobile = getGridTemplate(true)

    return (
        <Card className="flex flex-col ">
            <CardContext>
                <CardSort>
                    <CardBody>
                            <div className="flex flex-col w-full h-full ">
                                <CardHeader>
                                    <CardHeaderBase>
                                        <div className="hidden md:block w-full ">
                                            <StandingsHeader
                                                columns={columns}
                                                gridTemplate={gridTemplate}
                                                className="gap-2"
                                            />
                                        </div>
                                        <div className="md:hidden w-full">
                                            <StandingsHeader
                                                columns={mobileColumns}
                                                gridTemplate={
                                                    gridTemplateMobile
                                                }
                                                className="gap-2"
                                            />
                                        </div>
                                    </CardHeaderBase>
                                </CardHeader>

                                <div className="hidden md:block">
                                    <SortedRows
                                        processedData={processedData}
                                        columns={columns}
                                        highlightedTeam={highlightedTeam}
                                        maxRows={maxRows}
                                        gridTemplate={getGridTemplate(false)}
                                        className="gap-2"
                                    />
                                </div>
                                <div className="md:hidden">
                                    <SortedRows
                                        processedData={processedData}
                                        columns={mobileColumns}
                                        highlightedTeam={highlightedTeam}
                                        maxRows={maxRows}
                                        gridTemplate={getGridTemplate(true)}
                                        className="gap-2"
                                    />
                                </div>
                            </div>
                    </CardBody>
                </CardSort>
            </CardContext>
        </Card>
    )
}
