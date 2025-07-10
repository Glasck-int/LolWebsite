'use client'

import React from 'react'
import { StandingsRow } from './StandingsRow'
import { Column } from './types'
import { ProcessedStanding } from './StandingsDataProcessor'

/**
 * Standings rows component that handles the rendering logic for standings data.
 *
 * Manages the visibility of rows based on highlighted team and responsive behavior.
 * Calculates which rows to show on mobile vs desktop and handles highlighting logic.
 *
 * @param processedData - Processed standings data with team information and statistics
 * @param columns - Column definitions for the standings table
 * @param highlightedTeam - Optional team name to highlight in the standings
 * @param maxRows - Optional maximum number of rows to display (null for all rows)
 * @returns A component that renders the standings rows with proper visibility logic
 *
 * @example
 * ```tsx
 * <StandingsRows
 *   processedData={processedData}
 *   columns={columns}
 *   highlightedTeam="Team Liquid"
 *   maxRows={5}
 * />
 * ```
 */
export const StandingsRows = ({
    processedData,
    columns,
    highlightedTeam,
    maxRows,
}: {
    processedData: ProcessedStanding[]
    columns: Column<ProcessedStanding>[]
    highlightedTeam?: string
    maxRows?: number | null
}) => {
    return (
        <div className="flex flex-col flex-1">
            {processedData.map((item, index) => {
                // Find highlighted team index
                const highlightedIndex = highlightedTeam
                    ? processedData.findIndex(
                          (data) => data.standing.team === highlightedTeam
                      )
                    : -1

                // Calculate which rows to show based on highlighted team
                let shouldShowOnMobile = false
                let shouldShowOnDesktop = false

                if (highlightedIndex !== -1) {
                    if (maxRows === null) {
                        // Show all rows when maxRows is null
                        shouldShowOnMobile = true
                        shouldShowOnDesktop = true
                    } else {
                        // Default behavior: 3 rows on mobile, 4 rows on desktop
                        const mobileMaxRows = maxRows ?? 3
                        const desktopMaxRows = maxRows ?? 4

                        // Center around highlighted team
                        const mobileHalf = Math.floor(mobileMaxRows / 2)
                        const desktopHalf = Math.floor(desktopMaxRows / 2)

                        const mobileStart = Math.max(
                            0,
                            highlightedIndex - mobileHalf
                        )
                        const mobileEnd = mobileStart + mobileMaxRows
                        const desktopStart = Math.max(
                            0,
                            highlightedIndex - desktopHalf
                        )
                        const desktopEnd = desktopStart + desktopMaxRows

                        shouldShowOnMobile =
                            index >= mobileStart && index < mobileEnd
                        shouldShowOnDesktop =
                            index >= desktopStart && index < desktopEnd
                    }
                } else {
                    // No highlighted team, show top rows
                    if (maxRows === null) {
                        // Show all rows when maxRows is null
                        shouldShowOnMobile = true
                        shouldShowOnDesktop = true
                    } else {
                        // Default behavior: 3 rows on mobile, 4 rows on desktop
                        const mobileMaxRows = maxRows ?? 3
                        const desktopMaxRows = maxRows ?? 4

                        shouldShowOnMobile = index < mobileMaxRows
                        shouldShowOnDesktop = index < desktopMaxRows
                    }
                }

                // Determine CSS classes based on visibility
                let className = ''
                if (shouldShowOnMobile && shouldShowOnDesktop) {
                    className = 'flex' // Show on both mobile and desktop
                } else if (shouldShowOnMobile && !shouldShowOnDesktop) {
                    className = 'flex md:hidden' // Show only on mobile
                } else if (!shouldShowOnMobile && shouldShowOnDesktop) {
                    className = 'hidden md:flex' // Show only on desktop
                } else {
                    className = 'hidden' // Hide on both
                }

                return (
                    <div key={item.standing.team} className={className}>
                        <StandingsRow
                            item={item}
                            columns={columns}
                            isHighlighted={
                                item.standing.team === highlightedTeam
                            }
                        />
                    </div>
                )
            })}
        </div>
    )
}
