import React from 'react'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { Column } from '../types'
import {
    CardHeaderBase,
    CardHeaderSortContent,
} from '@/components/ui/card/index'

/**
 * Standings table header component.
 *
 * Renders the header row of a standings table with column titles and tooltips.
 * Uses CardHeaderSortContent for sortable columns and SubTitle for non-sortable ones.
 * Filters columns based on responsive visibility to avoid empty spaces.
 *
 * @template T - The type of data item that will be passed to the cell renderer
 * @param columns - Array of column configurations defining headers, tooltips, and styling
 * @param isMobile - Whether to show mobile version (filters out desktop-only columns)
 * @returns A header row component with sortable and non-sortable column headers
 *
 * @example
 * ```tsx
 * const columns: Column<ProcessedStanding>[] = [
 *   { key: 'place', header: '#', tooltip: 'Position', sortable: true },
 *   { key: 'team', header: 'Team', tooltip: 'Team name' }
 * ]
 *
 * <StandingsHeader columns={columns} isMobile={true} />
 * ```
 */
export const StandingsHeader = <T,>({
    columns,
    isMobile = false,
    gridTemplate,
    className,
}: {
    columns: Column<T>[]
    isMobile?: boolean
    gridTemplate?: string | null
    className?: string
}) => {
    // Filter columns based on responsive visibility
    const visibleColumns = columns.filter((col) => {
        if (isMobile) {
            // On mobile, exclude columns with 'hidden md:flex' or similar desktop-only classes
            return (
                !col.headerClassName?.includes('hidden md:flex') &&
                !col.headerClassName?.includes('hidden lg:flex')
            )
        } else {
            // On desktop, include all columns
            return true
        }
    })

    // Helper function to render header cell
    const renderHeaderCell = (col: Column<T>) => {
        if (col.sortable) {
            return (
                <CardHeaderSortContent
                    key={col.key}
                    sortName={col.key}
                    className={col.headerClassName}
                    tooltip={col.tooltip}
                >
                    {col.header}
                </CardHeaderSortContent>
            )
        } else {
            return (
                <SubTitle
                    key={col.key}
                    className={col.headerClassName}
                    children={col.header as string}
                    tooltip={col.tooltip}
                />
                
            )
        }
    }

    // If gridTemplate is provided, use grid layout
    if (gridTemplate) {
        return (
            <div
                className={`grid w-full items-center ${className}`}
                style={{
                    gridTemplateColumns: gridTemplate,
                }}
            >
                {visibleColumns.map((col) => (
                    <div key={col.key} className="">
                        {renderHeaderCell(col)}
                    </div>
                ))}
            </div>
        )
    }

    // Fallback to flex layout for backward compatibility
    const leftColumns = visibleColumns.slice(0, 2)
    const rightColumns = visibleColumns.slice(2)

    return (
        <CardHeaderBase
            className={`flex flex-row justify-between items-center w-full ${className}`}
        >
            <div className="flex items-center gap-8">
                {leftColumns.map(renderHeaderCell)}
            </div>
            <div className="flex items-center md:gap-4 gap-2 flex-1 justify-end">
                {rightColumns.map(renderHeaderCell)}
            </div>
        </CardHeaderBase>
    )
}
