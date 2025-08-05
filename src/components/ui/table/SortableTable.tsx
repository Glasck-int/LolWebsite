'use client'

import React, { useMemo, ReactNode } from 'react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './Table'
import { CardHeaderSortContent, CardSort, useSort } from '@/components/ui/card'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { cn } from '@/lib/utils'
import { useFlipAnimation } from '@/components/leagues/Standings/hooks/useFlipAnimation'
import { useTranslations } from 'next-intl'

/**
 * Determines background CSS classes for columns based on their statistical category.
 * Applies visual grouping through background colors to distinguish between different types of statistics.
 */
const getColumnBackgroundClass = (columnKey: string) => {
    if (['matchesPlayed', 'matchesWins', 'matchesLosses', 'matchesWinRate'].includes(columnKey)) {
        return 'bg-clear-violet/10'
    }
    // if (['gamesPlayed', 'gamesWins', 'gamesLosses', 'gamesWinRate'].includes(columnKey)) {
    //     return 'bg-blue/10'
    // }
    return ''
}


/**
 * Column configuration for SortableTable
 */
export interface TableColumn<T = unknown> {
    /** Unique key for the column */
    key: string
    /** Header content */
    header?: ReactNode
    /** Tooltip for header */
    tooltip?: string
    /** Cell renderer function */
    cell?: (item: T, position: number) => ReactNode
    /** Whether column is sortable */
    sortable?: boolean
    /** CSS classes for header */
    headerClassName?: string
    /** CSS classes for cells */
    cellClassName?: string
    /** Sort function for custom sorting */
    sortFn?: (a: T, b: T) => number
    /** Accessor function to get sortable value */
    accessor?: (item: T) => unknown
    /** Default sort direction - 'desc' for values where higher is better (winrates, wins) */
    defaultSortDirection?: 'asc' | 'desc'
}


/**
 * Props for SortableTable component
 */
interface SortableTableProps<T> {
    /** Data to display in table */
    data: T[]
    /** Column configurations */
    columns: TableColumn<T>[]
    /** Optional function to determine if row should be highlighted */
    isRowHighlighted?: (item: T, position: number) => boolean
    /** Optional class name for table container */
    className?: string
    /** Optional table caption for accessibility */
    caption?: string
    /** Optional empty state content */
    emptyState?: ReactNode
    /** Whether to show section headers (MATCHES/GAMES) */
    showSectionHeaders?: boolean
    /** Optional function to get unique key for each row (needed for animations) */
    getRowKey?: (item: T) => string
}

/**
 * Generic sortable table component with semantic HTML and the original Card styling.
 * Uses CardHeaderSortContent for sorting to match the original system exactly.
 */
export function SortableTable<T = unknown>({
    data,
    columns,
    isRowHighlighted,
    className,
    caption,
    emptyState,
    showSectionHeaders = true,
    getRowKey
}: SortableTableProps<T>) {
    const t = useTranslations('SortableTable')
    if (!data.length) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground ">
                {emptyState || t('emptyState')}
            </div>
        )
    }

    return (
        <CardSort>
            <SortableTableContent
                data={data}
                columns={columns}
                isRowHighlighted={isRowHighlighted}
                className={className}
                caption={caption}
                showSectionHeaders={showSectionHeaders}
                getRowKey={getRowKey}
            />
        </CardSort>
    )
}

// Type for sort state from the card module
type SortState = {
    key: string | null
    direction: 'asc' | 'desc' | null
}

/**
 * Adapter to make any data compatible with useFlipAnimation
 */
function useGenericFlipAnimation<T>(activeSort: SortState, data: T[], getRowKey?: (item: T) => string) {
    // Convert generic data to a format that useFlipAnimation expects
    const flipData = useMemo(() => {
        if (!getRowKey) return []
        
        return data.map(item => ({
            // Create a minimal object that satisfies the hook's type requirements
            team: getRowKey(item),
            teamImage: '',
            totalGames: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            gamesStats: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                winRate: 0
            }
        }))
    }, [data, getRowKey])
    
    return useFlipAnimation(activeSort, flipData)
}

/**
 * Internal component that uses the sort context from CardSort
 */
function SortableTableContent<T = unknown>({
    data,
    columns,
    isRowHighlighted,
    className,
    caption,
    showSectionHeaders = true,
    getRowKey
}: Omit<SortableTableProps<T>, 'emptyState'>) {
    const { activeSort } = useSort()
    const t = useTranslations('SortableTable')

    // Sort data based on current sort configuration
    const sortedData = useMemo(() => {
        if (!activeSort.key) {
            // No sorting applied, return data as-is
            return data
        }

        const column = columns.find(col => col.key === activeSort.key)
        if (!column) return data

        return [...data].sort((a, b) => {
            let direction = activeSort.direction
            if (!direction) return 0

            // For columns with defaultSortDirection='desc' (like winrates), 
            // we need to adjust the sorting logic
            const shouldInvertSort = column.defaultSortDirection === 'desc'

            // Use custom sort function if provided
            if (column.sortFn) {
                const comparison = column.sortFn(a, b)
                let result = direction === 'desc' ? -comparison : comparison
                return shouldInvertSort ? -result : result
            }

            // Use accessor function if provided (this should be the main path)
            if (column.accessor) {
                const aVal = column.accessor(a)
                const bVal = column.accessor(b)
                
                // Handle null/undefined values
                if (aVal == null && bVal == null) return 0
                if (aVal == null) return 1
                if (bVal == null) return -1

                let comparison = 0
                // Numeric comparison
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    comparison = aVal - bVal
                } else {
                    // String comparison
                    comparison = String(aVal).localeCompare(String(bVal))
                }
                
                let result = direction === 'desc' ? -comparison : comparison
                return shouldInvertSort ? -result : result
            }

            // Fallback: try to access the property directly from the object
            const aVal = (a as Record<string, unknown>)[activeSort.key!]
            const bVal = (b as Record<string, unknown>)[activeSort.key!]
            
            if (aVal == null && bVal == null) return 0
            if (aVal == null) return 1
            if (bVal == null) return -1

            let comparison = 0
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal
            } else {
                comparison = String(aVal).localeCompare(String(bVal))
            }
            
            let result = direction === 'desc' ? -comparison : comparison
            return shouldInvertSort ? -result : result
        })
    }, [data, columns, activeSort])

    // Calculate positions for each row based on current display order
    const rowPositions = useMemo(() => {
        // Visual positions based on current sort direction
        // Ascending: 1, 2, 3, 4, 5...
        // Descending: 5, 4, 3, 2, 1... (reverse order)
        if (activeSort.direction === 'desc') {
            // For descending order, reverse the positions
            return sortedData.map((_, index) => sortedData.length - index)
        }
        // For ascending or no sort, positions are 1, 2, 3, 4, 5...
        return sortedData.map((_, index) => index + 1)
    }, [sortedData, activeSort.direction])

    // Use the FLIP animation hook with sorted data
    const { containerRef } = useGenericFlipAnimation(activeSort, sortedData, getRowKey)

    return (
        <div ref={containerRef}>
            {/* Vraie table HTML avec header intégré */}
            <Table className={cn("standings-table bg-transparent w-full table-auto ", className)}>
                {caption && <caption className="sr-only">{caption}</caption>}
                
                <TableHeader className="bg-white-04 ">
                    {/* Section headers row for combined table */}
                    {showSectionHeaders && columns.some(col => col.key.startsWith('matches') || col.key.startsWith('games')) && (
                        <TableRow className="border-b border-0 bg-white-04">
                            <TableHead className="text-center"></TableHead> {/* Place */}
                            <TableHead className="text-left"></TableHead> {/* Team */}
                            <TableHead colSpan={4} className="text-center py-2">
                                <div className="flex justify-center w-full">
                                    <SubTitle className="text-clear-grey">{t('sectionHeaders.matches')}</SubTitle>
                                </div>
                            </TableHead>
                            <TableHead colSpan={4} className="text-center py-2">
                                <div className="flex justify-center w-full">
                                    <SubTitle className="text-clear-grey">{t('sectionHeaders.games')}</SubTitle>
                                </div>
                            </TableHead>
                            <TableHead className="text-center"></TableHead> {/* Form */}
                        </TableRow>
                    )}
                    
                    {/* Main headers row */}
                    <TableRow className="hover:bg-transparent ">
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                className={cn(
                                    // Styles des headers existants récupérés de CardHeaderBase
                                    "text-clear-grey font-medium text-sm px-2 py-2 md:px-4 md:py-3",
                                    "content-center min-h-[40px] md:min-h-[45px] text-center",
                                    column.headerClassName
                                )}
                                title={column.tooltip}
                            >
                                <div className={cn(
                                    "flex items-center w-full h-full",
                                    column.key === 'team' || column.key === 'group' || column.key === 'form' ? "justify-start" : "justify-center"
                                )}>
                                    {column.sortable ? (
                                        <CardHeaderSortContent
                                            sortName={column.key}
                                            tooltip={column.tooltip}
                                            className={cn(
                                                "w-full h-full flex items-center",
                                                column.key === 'team' || column.key === 'group' || column.key === 'form' ? "justify-start" : "justify-center"
                                            )}
                                        >
                                            {column.header}
                                        </CardHeaderSortContent>
                                    ) : (
                                        <SubTitle className={cn(
                                            "w-full h-full flex items-center text-clear-grey",
                                            column.key === 'team' || column.key === 'group' || column.key === 'form' ? "justify-start" : "justify-center"
                                        )} tooltip={column.tooltip}>
                                            {column.header as string}
                                        </SubTitle>
                                    )}
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {sortedData.map((item, index) => {
                        const rowKey = getRowKey ? getRowKey(item) : `row-${index}`
                        return (
                            <TableRow
                                key={rowKey}
                                data-team-key={rowKey}
                                className={cn(
                                    "hover:bg-white/5 transition-colors h-full",
                                    isRowHighlighted?.(item, rowPositions[index]) && "bg-accent/20 hover:bg-accent/30"
                                )}
                            >
                            {columns.map((column) => {
                                const backgroundClass = getColumnBackgroundClass(column.key)
                                return (
                                    <TableCell
                                        key={column.key}
                                        className={cn(
                                            "px-0 py-1 md:px-0 md:py-2 align-middle text-white h-full",
                                            column.key === 'team' || column.key === 'group' || column.key === 'form' ? "text-left" : "text-center",
                                            backgroundClass,
                                            column.cellClassName
                                        )}
                                    >
                                        {column.cell ? column.cell(item, rowPositions[index]) : String((item as Record<string, unknown>)[column.key] ?? '')}
                                    </TableCell>
                                )
                            })}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

