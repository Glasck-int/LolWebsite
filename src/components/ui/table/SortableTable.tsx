'use client'

import React, { useState, useMemo, ReactNode } from 'react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './Table'
import { CardHeaderBase, CardHeaderSortContent, CardSort, useSort } from '@/components/ui/card'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { cn } from '@/lib/utils'

/**
 * Determines background CSS classes for columns based on their statistical category.
 * Applies visual grouping through background colors to distinguish between different types of statistics.
 */
const getColumnBackgroundClass = (columnKey: string) => {
    if (['matchesPlayed', 'matchesWins', 'matchesLosses', 'matchesWinRate'].includes(columnKey)) {
        return 'bg-clear-violet/10'
    }
    if (['gamesPlayed', 'gamesWins', 'gamesLosses', 'gamesWinRate'].includes(columnKey)) {
        return 'bg-blue/10'
    }
    return ''
}

/**
 * Column configuration for SortableTable
 */
export interface TableColumn<T = any> {
    /** Unique key for the column */
    key: string
    /** Header content */
    header?: ReactNode
    /** Tooltip for header */
    tooltip?: string
    /** Cell renderer function */
    cell?: (item: T, index: number) => ReactNode
    /** Whether column is sortable */
    sortable?: boolean
    /** CSS classes for header */
    headerClassName?: string
    /** CSS classes for cells */
    cellClassName?: string
    /** Sort function for custom sorting */
    sortFn?: (a: T, b: T) => number
    /** Accessor function to get sortable value */
    accessor?: (item: T) => any
}

/**
 * Sort configuration
 */
interface SortConfig {
    key: string | null
    direction: 'asc' | 'desc'
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
    isRowHighlighted?: (item: T, index: number) => boolean
    /** Optional class name for table container */
    className?: string
    /** Optional table caption for accessibility */
    caption?: string
    /** Optional empty state content */
    emptyState?: ReactNode
    /** Whether to show section headers (MATCHES/GAMES) */
    showSectionHeaders?: boolean
}

/**
 * Generic sortable table component with semantic HTML and the original Card styling.
 * Uses CardHeaderSortContent for sorting to match the original system exactly.
 */
export function SortableTable<T = any>({
    data,
    columns,
    isRowHighlighted,
    className,
    caption,
    emptyState = "Aucune donnée disponible",
    showSectionHeaders = true
}: SortableTableProps<T>) {
    if (!data.length) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                {emptyState}
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
            />
        </CardSort>
    )
}

/**
 * Internal component that uses the sort context from CardSort
 */
function SortableTableContent<T = any>({
    data,
    columns,
    isRowHighlighted,
    className,
    caption,
    showSectionHeaders = true
}: Omit<SortableTableProps<T>, 'emptyState'>) {
    const { activeSort } = useSort()

    // Sort data based on current sort configuration
    const sortedData = useMemo(() => {
        if (!activeSort.key) return data

        const column = columns.find(col => col.key === activeSort.key)
        if (!column) return data

        return [...data].sort((a, b) => {
            let aVal, bVal

            // Use custom sort function if provided
            if (column.sortFn) {
                const result = column.sortFn(a, b)
                return activeSort.direction === 'desc' ? -result : result
            }

            // Use accessor function if provided
            if (column.accessor) {
                aVal = column.accessor(a)
                bVal = column.accessor(b)
            } else {
                // Default: try to access property by key
                aVal = (a as any)[column.key]
                bVal = (b as any)[column.key]
            }

            // Handle null/undefined values
            if (aVal == null && bVal == null) return 0
            if (aVal == null) return 1
            if (bVal == null) return -1

            // Numeric comparison
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                const result = aVal - bVal
                return activeSort.direction === 'desc' ? -result : result
            }

            // String comparison
            const result = String(aVal).localeCompare(String(bVal))
            return activeSort.direction === 'desc' ? -result : result
        })
    }, [data, columns, activeSort]) 

    return (
        <>
            {/* Vraie table HTML avec header intégré */}
            <Table className={cn("standings-table bg-transparent w-full table-auto", className)}>
                {caption && <caption className="sr-only">{caption}</caption>}
                
                <TableHeader className="bg-white-04 ">
                    {/* Section headers row for combined table */}
                    {showSectionHeaders && columns.some(col => col.key.startsWith('matches') || col.key.startsWith('games')) && (
                        <TableRow className="hover:bg-transparent border-b border-0 bg-white-04">
                            <TableHead className="text-center"></TableHead> {/* Place */}
                            <TableHead className="text-left"></TableHead> {/* Team */}
                            <TableHead colSpan={4} className="text-center py-2">
                                <div className="flex justify-center w-full">
                                    <SubTitle className="text-clear-grey">MATCHES</SubTitle>
                                </div>
                            </TableHead>
                            <TableHead colSpan={4} className="text-center py-2">
                                <div className="flex justify-center w-full">
                                    <SubTitle className="text-clear-grey">GAMES</SubTitle>
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
                    {sortedData.map((item, index) => (
                        <TableRow
                            key={`${index}-${activeSort.key}-${activeSort.direction}`}
                            className={cn(
                                "hover:bg-white/5 transition-colors h-full",
                                isRowHighlighted?.(item, index) && "bg-accent/20 hover:bg-accent/30"
                            )}
                        >
                            {columns.map((column) => {
                                const backgroundClass = getColumnBackgroundClass(column.key)
                                return (
                                    <TableCell
                                        key={column.key}
                                        className={cn(
                                            "px-2 py-3 md:px-6 md:py-4 align-middle text-white h-full",
                                            column.key === 'team' || column.key === 'group' || column.key === 'form' ? "text-left" : "text-center",
                                            backgroundClass,
                                            column.cellClassName
                                        )}
                                    >
                                        {column.cell ? column.cell(item, index) : (item as any)[column.key]}
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

