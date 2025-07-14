'use client'

import React from 'react'
import { useSort } from '@/components/ui/card/index'
import { ProcessedGameStats, ProcessedStanding } from './StandingsDataProcessor'
import { Column } from '../types'
import { StandingsRow } from '../components/StandingsRow'
import { useFlipAnimation } from '../hooks/useFlipAnimation'

/**
 * Dynamic standings rows component with sorting and animation capabilities.
 *
 * This component handles the complex logic of sorting standings data based on user interaction,
 * providing smooth animations during transitions, and managing responsive visibility with
 * team highlighting support. Unlike static row components, this one dynamically reorders
 * data and updates position numbers based on the active sort criteria.
 *
 * Key features:
 * - Dynamic sorting based on various statistics (place, wins, losses, win rate, etc.)
 * - FLIP animations for smooth transitions between sort states
 * - Dynamic position numbering that updates with sort order
 * - Responsive row limiting with team-centered visibility
 * - Support for both ProcessedStanding and ProcessedGameStats data types
 *
 * The component integrates with the global sort state through useSort hook and provides
 * visual feedback during data transitions through flip animations.
 *
 * @param props - Component properties
 * @param props.processedData - Array of processed standings or game statistics data to sort and display.
 *                             Can handle both match-level and game-level statistics.
 * @param props.columns - Array of column configurations defining how each data field should be rendered.
 *                       Columns specify cell renderers, headers, tooltips, and styling.
 * @param props.highlightedTeam - Optional team name to emphasize in the standings.
 *                               When provided, the view centers around this team and applies highlighting.
 * @param props.maxRows - Maximum number of rows to display on each device type.
 *                       When null, shows all rows. Otherwise applies responsive limits.
 * @param props.gridTemplate - CSS Grid template string for consistent column layout.
 *                            Must match header component for proper alignment.
 * @param props.className - Additional CSS classes to apply to individual row components.
 *
 * @returns Sorted and animated standings rows with dynamic positioning
 *
 * @example
 * ```tsx
 * // Basic sortable standings
 * <SortedMixedRows
 *   processedData={standingsData}
 *   columns={standingsColumns}
 *   maxRows={10}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 * />
 *
 * // With team highlighting and responsive limits
 * <SortedMixedRows
 *   processedData={gameStatsData}
 *   columns={gameColumns}
 *   highlightedTeam="Team Liquid"
 *   maxRows={5}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 *   className="border-b"
 * />
 *
 * // Show all teams without limits
 * <SortedMixedRows
 *   processedData={standingsData}
 *   columns={standingsColumns}
 *   maxRows={null}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 * />
 * ```
 *
 * @see {@link useSort} for sort state management
 * @see {@link useFlipAnimation} for animation implementation
 * @see {@link StandingsRow} for individual row rendering
 * @see {@link StandingsRows} for static row display without sorting
 */
export const SortedMixedRows = ({
    processedData,
    columns,
    highlightedTeam,
    maxRows,
    gridTemplate,
    className,
}: {
    processedData: ProcessedStanding[] | ProcessedGameStats[]
    columns: Column<ProcessedStanding>[] | Column<ProcessedGameStats>[]
    highlightedTeam?: string
    maxRows?: number | null
    gridTemplate: string | null
    className?: string
}) => {
    const { activeSort } = useSort()
    const { containerRef, isAnimating } = useFlipAnimation([activeSort, processedData])
    
    /**
     * Memoized sorted data based on active sort state.
     * Handles both default sorting (by place) and dynamic sorting by user-selected criteria.
     * Supports multiple data types and statistics for comprehensive sorting options.
     */
    const sortedData = React.useMemo(() => {
        /**
         * Default sorting: When no sort is active, sort by original place/position.
         * This maintains the tournament's official standings order.
         */
        if (!activeSort.key)
            return processedData.sort((a, b) => {
                const aPlace = 'standing' in a ? a.standing.place || 0 : 0
                const bPlace = 'standing' in b ? b.standing.place || 0 : 0
                return aPlace - bPlace
            })

        /**
         * Dynamic sorting: Sort by user-selected criteria.
         * Creates a new array to avoid mutating the original data.
         */
        return [...processedData].sort((a, b) => {
            let comparison = 0
            const key = activeSort.key
            const direction = activeSort.direction

            if (!key || !direction) return 0

            /**
             * Sort comparison logic for different statistical categories.
             * Handles both ProcessedStanding and ProcessedGameStats data structures.
             * Each case extracts the appropriate value and calculates comparison.
             */
            switch (key) {
                case 'place':
                    const aPlace = 'standing' in a ? a.standing.place || 0 : 0
                    const bPlace = 'standing' in b ? b.standing.place || 0 : 0
                    comparison = bPlace - aPlace
                    break
                case 'played':
                case 'matchesPlayed':
                    comparison =
                        ('totalGames' in a
                            ? a.totalGames
                            : a.gamesStats.totalGames) -
                        ('totalGames' in b
                            ? b.totalGames
                            : b.gamesStats.totalGames)
                    break
                case 'gamesPlayed':
                    comparison =
                        ('gamesStats' in a ? a.gamesStats.totalGames : 0) -
                        ('gamesStats' in b ? b.gamesStats.totalGames : 0)
                    break
                case 'wins':
                case 'matchesWins':
                    const aWins =
                        'standing' in a ? a.standing.winSeries || 0 : a.wins || 0
                    const bWins =
                        'standing' in b ? b.standing.winSeries || 0 : b.wins || 0
                    comparison = aWins - bWins
                    break
                case 'gamesWins':
                    const aGamesWins = 'gamesStats' in a ? a.gamesStats.wins : 0
                    const bGamesWins = 'gamesStats' in b ? b.gamesStats.wins : 0
                    comparison = aGamesWins - bGamesWins
                    break
                case 'losses':
                case 'matchesLosses':
                    const aLosses =
                        'standing' in a
                            ? a.standing.lossSeries || 0
                            : a.losses || 0
                    const bLosses =
                        'standing' in b
                            ? b.standing.lossSeries || 0
                            : b.losses || 0
                    comparison = aLosses - bLosses
                    break
                case 'gamesLosses':
                    const aGamesLosses = 'gamesStats' in a ? a.gamesStats.losses : 0
                    const bGamesLosses = 'gamesStats' in b ? b.gamesStats.losses : 0
                    comparison = aGamesLosses - bGamesLosses
                    break
                case 'winRate':
                case 'matchesWinRate':
                    comparison =
                        ('winRate' in a
                            ? a.winRate || 0
                            : a.gamesStats.winRate || 0) -
                        ('winRate' in b
                            ? b.winRate || 0
                            : b.gamesStats.winRate || 0)
                    break
                case 'gamesWinRate':
                    const aGamesWinRate = 'gamesStats' in a ? a.gamesStats.winRate : 0
                    const bGamesWinRate = 'gamesStats' in b ? b.gamesStats.winRate : 0
                    comparison = aGamesWinRate - bGamesWinRate
                    break
                case 'form':
                    comparison = 0 // Placeholder
                    break
                default:
                    return 0
            }

            /**
             * Apply sort direction to comparison result.
             * 'desc' inverts the comparison for descending order.
             */
            return activeSort.direction === 'desc' ? -comparison : comparison
        })
    }, [processedData, activeSort])

    return (
        <div ref={containerRef} className={`flex flex-col flex-1`}>
            {sortedData.map((item, index) => {
                /**
                 * Find the position of the highlighted team in the current sorted data.
                 * This is recalculated for each item to ensure consistent centering
                 * as the sort order may have changed the team's position.
                 */
                const highlightedIndex = highlightedTeam
                    ? sortedData.findIndex(
                          (data) =>
                              ('standing' in data
                                  ? data.standing.team
                                  : data.team) === highlightedTeam
                      )
                    : -1

                /**
                 * Calculate responsive visibility for current row.
                 * Determines if this row should be shown on mobile vs desktop
                 * based on highlighted team position and row limits.
                 */
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

                /**
                 * Extract team identifier for keys and highlighting.
                 * Handles both ProcessedStanding and ProcessedGameStats structures.
                 */
                const teamKey = 'standing' in item ? item.standing.team : item.team
                
                return (
                    <div
                        key={teamKey}
                        data-team-key={teamKey}
                        className={classNameAppend}
                        style={{
                            zIndex: highlightedTeam && teamKey === highlightedTeam ? 10 : 1,
                        }}
                    >
                        <StandingsRow
                            item={item}
                            columns={columns as Column<typeof item>[]}
                            isHighlighted={
                                ('standing' in item
                                    ? item.standing.team
                                    : item.team) === highlightedTeam
                            }
                            gridTemplate={gridTemplate}
                            className={className}
                            sortedPosition={index + 1} // Dynamic position based on current sort order
                        />
                    </div>
                )
            })}
        </div>
    )
}
