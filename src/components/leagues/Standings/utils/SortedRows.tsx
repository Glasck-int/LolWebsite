'use client'

import React from 'react'
import { useSort } from '@/components/ui/card/index'
import {
    ProcessedGameStats,
    ProcessedStanding,
} from './StandingsDataProcessor'
import { Column } from '../types'
import { StandingsRow } from '../components/StandingsRow'
import { useFlipAnimation } from '../hooks/useFlipAnimation'

/**
 * Simplified dynamic standings rows component with sorting capabilities.
 *
 * This component provides a streamlined version of SortedMixedRows with basic sorting
 * functionality for standings data. It handles dynamic reordering based on user-selected
 * criteria and includes responsive visibility management with team highlighting support.
 * 
 * This version uses a simplified sorting algorithm compared to SortedMixedRows and may
 * be used for specific use cases where the full feature set isn't required.
 *
 * Key features:
 * - Dynamic sorting based on basic statistics (place, wins, losses, win rate)
 * - FLIP animations for smooth transitions between sort states
 * - Responsive row limiting with team-centered visibility
 * - Support for both ProcessedStanding and ProcessedGameStats data types
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
 * @returns Sorted and animated standings rows with basic functionality
 *
 * @example
 * ```tsx
 * // Basic sortable standings
 * <SortedRows
 *   processedData={standingsData}
 *   columns={standingsColumns}
 *   maxRows={10}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 * />
 *
 * // With team highlighting
 * <SortedRows
 *   processedData={gameStatsData}
 *   columns={gameColumns}
 *   highlightedTeam="Team Liquid"
 *   maxRows={5}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 * />
 * ```
 *
 * @see {@link SortedMixedRows} for full-featured sorting with advanced statistics support
 * @see {@link useSort} for sort state management
 * @see {@link useFlipAnimation} for animation implementation
 * @see {@link StandingsRow} for individual row rendering
 */
export const SortedRows = ({
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
    
    // Sort data based on activeSort
    const sortedData = React.useMemo(() => {
        // Early return with empty array if processedData is null/undefined
        if (!processedData || !Array.isArray(processedData)) {
            return []
        }

        if (!activeSort.key)
            return processedData.sort((a, b) => {
                const aPlace = 'standing' in a ? (a.standing.place || 0) : 0
                const bPlace = 'standing' in b ? (b.standing.place || 0) : 0
                return aPlace - bPlace
            })

        return [...processedData].sort((a, b) => {
            let comparison = 0
            const key = activeSort.key
            const direction = activeSort.direction

            if (!key || !direction) return 0

            console.log(key, direction)

            switch (key) {
                case 'place':
                    const aPlace = 'standing' in a ? (a.standing.place || 0) : 0
                    const bPlace = 'standing' in b ? (b.standing.place || 0) : 0
                    comparison = bPlace - aPlace
                    break
                case 'played':
                    comparison = ('totalGames' in a ? a.totalGames : a.gamesStats.totalGames) - 
                                ('totalGames' in b ? b.totalGames : b.gamesStats.totalGames)
                    break
                case 'wins':
                    const aWins = 'standing' in a ? (a.standing.winGames || 0) : (a.wins || 0)
                    const bWins = 'standing' in b ? (b.standing.winGames || 0) : (b.wins || 0)
                    comparison = aWins - bWins
                    break
                case 'losses':
                    const aLosses = 'standing' in a ? (a.standing.lossGames || 0) : (a.losses || 0)
                    const bLosses = 'standing' in b ? (b.standing.lossGames || 0) : (b.losses || 0)
                    comparison = aLosses - bLosses
                    break
                case 'winRate':
                    comparison = ('winRate' in a ? a.winRate || 0 : a.gamesStats.winRate || 0) - 
                                ('winRate' in b ? b.winRate || 0 : b.gamesStats.winRate || 0)
                    break
                case 'form':
                    comparison = 0 // Placeholder
                    break
                default:
                    return 0
            }

            return activeSort.direction === 'desc' ? -comparison : comparison
        })
    }, [processedData, activeSort])

    return (
        <div ref={containerRef} className={`flex flex-col flex-1`}>
            {sortedData.map((item, index) => {
                // Find highlighted team index in sorted data
                const highlightedIndex = highlightedTeam
                    ? sortedData.findIndex(
                          (data) => ('standing' in data ? data.standing.team : data.team) === highlightedTeam
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
                                ('standing' in item ? item.standing.team : item.team) === highlightedTeam
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
