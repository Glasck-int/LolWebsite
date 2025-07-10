import React from 'react'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { Column } from './types'
import { CardHeaderBase } from '@/components/ui/card/index'

/**
 * Standings table header component.
 *
 * Renders the header row of a standings table with column titles and tooltips.
 * Splits columns into left and right sections for responsive layout.
 * Filters columns based on responsive visibility to avoid empty spaces.
 *
 * @template T - The type of data item that will be passed to the cell renderer
 * @param columns - Array of column configurations defining headers, tooltips, and styling
 * @param isMobile - Whether to show mobile version (filters out desktop-only columns)
 * @returns A header row component with column titles and tooltips
 *
 * @example
 * ```tsx
 * const columns: Column<ProcessedStanding>[] = [
 *   { key: 'place', header: '#', tooltip: 'Position' },
 *   { key: 'team', header: 'Team', tooltip: 'Team name' }
 * ]
 *
 * <StandingsHeader columns={columns} isMobile={true} />
 * ```
 */
export const StandingsHeader = <T,>({
    columns,
    isMobile = false,
}: {
    columns: Column<T>[]
    isMobile?: boolean
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

    const leftColumns = visibleColumns.slice(0, 2)
    const rightColumns = visibleColumns.slice(2)

    return (
        <CardHeaderBase className="flex flex-row justify-between items-center w-full">
            <div className="flex items-center gap-8">
                {leftColumns.map((col) => (
                    <SubTitle
                        key={col.key}
                        className={col.headerClassName}
                        children={col.header as string}
                        tooltip={col.tooltip}
                    />
                ))}
            </div>
            <div className="flex items-center md:gap-4 gap-2 flex-1 justify-end">
                {rightColumns.map((col) => (
                    <SubTitle
                        key={col.key}
                        className={col.headerClassName}
                        children={col.header as string}
                        tooltip={col.tooltip}
                    />
                ))}
            </div>
        </CardHeaderBase>
    )
}
