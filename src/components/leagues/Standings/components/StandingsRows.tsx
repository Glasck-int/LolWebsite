'use client'

import React from 'react'
import { StandingsRow } from './StandingsRow'
import { Column } from '../types'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'

/**
 * Standings rows container component that manages row visibility and responsive display logic.
 *
 * This component handles the complex logic for determining which standings rows should be visible
 * on different screen sizes, with special behavior for highlighting specific teams. It calculates
 * responsive visibility based on team highlighting, centering the highlighted team when possible,
 * and applying appropriate CSS classes for mobile/desktop display.
 *
 * The component is designed to work with static data that maintains its original order (unlike
 * SortedMixedRows which handles dynamic sorting). It provides consistent row limiting behavior
 * across different viewport sizes while ensuring highlighted teams remain visible.
 *
 * @param props - Component properties
 * @param props.processedData - Array of processed standings data with team information and statistics.
 *                             Expected to be in the original tournament order (by place).
 * @param props.columns - Array of column definitions that specify how to render each data field.
 *                       Used by individual StandingsRow components for cell rendering.
 * @param props.highlightedTeam - Optional team name to emphasize in the standings display.
 *                               When provided, the component centers the view around this team
 *                               and applies special highlighting styling.
 * @param props.maxRows - Maximum number of rows to display on each device type.
 *                       When null, shows all rows. When specified, shows different amounts
 *                       on mobile (typically 3) vs desktop (typically 4).
 * @param props.gridTemplate - CSS Grid template string for consistent column layout.
 *                            Passed through to individual row components to maintain alignment
 *                            with the header component.
 * @param props.className - Additional CSS classes to apply to individual row components.
 *                         Applied to each StandingsRow for consistent styling.
 *
 * @returns A container component that renders appropriately filtered standings rows
 *
 * @example
 * ```tsx
 * // Display top 5 teams with Team Liquid highlighted
 * <StandingsRows
 *   processedData={processedStandings}
 *   columns={standingsColumns}
 *   highlightedTeam="Team Liquid"
 *   maxRows={5}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 *   className="border-b border-gray-200"
 * />
 *
 * // Show all teams without highlighting
 * <StandingsRows
 *   processedData={processedStandings}
 *   columns={standingsColumns}
 *   maxRows={null}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 * />
 *
 * // Mobile-optimized display with fewer visible teams
 * <StandingsRows
 *   processedData={processedStandings}
 *   columns={mobileColumns}
 *   highlightedTeam="G2 Esports"
 *   maxRows={3}
 *   gridTemplate="40px 1fr 50px"
 * />
 * ```
 *
 * @see {@link StandingsRow} for individual row rendering
 * @see {@link SortedMixedRows} for sortable row display with dynamic positioning
 * @see {@link ProcessedStanding} for data structure requirements
 */
export const StandingsRows = ({
    processedData,
    columns,
    highlightedTeam,
    maxRows,
    gridTemplate,
    className,
}: {
    processedData: ProcessedStanding[]
    columns: Column<ProcessedStanding>[]
    highlightedTeam?: string
    maxRows?: number | null
    gridTemplate: string | null
    className?: string
}) => {
    return (
        <div className={`flex flex-col flex-1 `}>
            {processedData.map((item, index) => {
                /**
                 * Find the index of the highlighted team in the current data set.
                 * This is used to center the view around the highlighted team.
                 */
                const highlightedIndex = highlightedTeam
                    ? processedData.findIndex(
                          (data) => data.standing.team === highlightedTeam
                      )
                    : -1

                /**
                 * Calculate responsive visibility based on highlighted team and device type.
                 * Mobile and desktop may show different numbers of rows to optimize screen space.
                 */
                let shouldShowOnMobile = false
                let shouldShowOnDesktop = false

                if (highlightedIndex !== -1) {
                    // Highlighted team is present - center view around it
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
                    // No highlighted team - show top rows
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

                /**
                 * Generate appropriate CSS classes based on calculated visibility.
                 * Uses Tailwind responsive classes to show/hide rows on different screen sizes.
                 */
                let classNameAppend = ''
                if (shouldShowOnMobile && shouldShowOnDesktop) {
                    classNameAppend = 'flex' // Show on both mobile and desktop
                } else if (shouldShowOnMobile && !shouldShowOnDesktop) {
                    classNameAppend = 'flex md:hidden' // Show only on mobile
                } else if (!shouldShowOnMobile && shouldShowOnDesktop) {
                    classNameAppend = 'hidden md:flex' // Show only on desktop
                } else {
                    classNameAppend = 'hidden' // Hide on both
                }

                return (
                    <div key={item.standing.team} className={classNameAppend}>
                        <StandingsRow
                            item={item}
                            columns={columns}
                            isHighlighted={
                                item.standing.team === highlightedTeam
                            }
                            gridTemplate={gridTemplate}
                            className={className}
                        />
                    </div>
                )
            })}
        </div>
    )
}
