'use client'

import React from 'react'
import { useSort } from '@/components/ui/card/index'
import { ProcessedStanding } from '../StandingsDataProcessor'
import { Column } from '../types'
import { StandingsRow } from '../StandingsRow'

/**
 * Renders sorted standings rows based on active sort state.
 *
 * Displays standings data with sorting functionality based on the active sort key.
 * Supports highlighting specific teams and responsive row display.
 *
 * @param processedData - Processed standings data to display
 * @param columns - Column configuration for rendering
 * @param highlightedTeam - Optional team name to highlight
 * @param maxRows - Optional maximum number of rows to display
 * @returns Sorted and filtered standings rows
 */
export const SortedRows = ({
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
    const { activeSort } = useSort()

    // Sort data based on activeSort
    const sortedData = React.useMemo(() => {
        if (!activeSort) return processedData

        return [...processedData].sort((a, b) => {
            console.log(activeSort)
            switch (activeSort) {
                case 'place':
                    // Sort in descending order for 'place'
                    return (b.standing.place || 0) - (a.standing.place ||  0)
                case 'played':
                    return a.totalGames - b.totalGames
                case 'wins':
                    return (a.standing.winGames || 0) - (b.standing.winGames || 0)
                case 'losses':
                    return (a.standing.lossGames || 0) - (b.standing.lossGames || 0)
                case 'winRate':
                    return (a.winRate || 0) - (b.winRate || 0)
                case 'form':
                    // Sort by recent form (you might need to implement this based on your form data)
                    return 0 // Placeholder - implement based on your form logic
                default:
                    return 0
            }
        })
    }, [processedData, activeSort])

    return (
        <div className="flex flex-col flex-1">
            {sortedData.map((item, index) => {
                // Find highlighted team index in sorted data
                const highlightedIndex = highlightedTeam
                    ? sortedData.findIndex(
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
