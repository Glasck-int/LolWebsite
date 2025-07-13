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
                        />
                    </div>
                )
            })}
        </div>
    )
}
