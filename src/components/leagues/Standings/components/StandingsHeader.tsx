import React from 'react'
import { SubTitle } from '@/components/ui/text/SubTitle'
import { Column } from '../types'
import {
    CardHeaderBase,
    CardHeaderSortContent,
} from '@/components/ui/card/index'

/**
 * Standings table header component that renders column headers with sorting capabilities.
 *
 * This component provides a flexible header row for standings tables, supporting both sortable
 * and non-sortable columns. It handles responsive design by filtering columns based on device
 * type and supports both CSS Grid and Flexbox layouts for different use cases.
 *
 * The component integrates with the sorting system through CardHeaderSortContent components
 * for sortable columns and uses SubTitle components for static headers. It automatically
 * filters out columns that shouldn't be visible on mobile devices based on their CSS classes.
 *
 * @template T - The type of data item that columns will receive (ProcessedStanding or ProcessedGameStats)
 *
 * @param props - Component properties
 * @param props.columns - Array of column configurations defining headers, tooltips, and styling.
 *                       Each column specifies its display properties, sorting behavior, and responsive visibility.
 * @param props.isMobile - Whether to render the mobile-optimized version of the header.
 *                        When true, columns with desktop-only CSS classes are filtered out.
 * @param props.gridTemplate - CSS Grid template string for column layout.
 *                            When provided, uses CSS Grid instead of flexbox layout for precise column sizing.
 * @param props.className - Additional CSS classes to apply to the header container.
 *                         Combined with base styling for customization.
 *
 * @returns A header row component with appropriate column headers and sorting controls
 *
 * @example
 * ```tsx
 * // Basic usage with sortable columns
 * const columns: Column<ProcessedStanding>[] = [
 *   {
 *     key: 'place',
 *     header: '#',
 *     tooltip: 'Team ranking position',
 *     sortable: true,
 *     headerClassName: 'cursor-pointer'
 *   },
 *   {
 *     key: 'team',
 *     header: 'Team',
 *     tooltip: 'Team name',
 *     sortable: false
 *   },
 *   {
 *     key: 'wins',
 *     header: 'W',
 *     tooltip: 'Wins',
 *     sortable: true,
 *     headerClassName: 'hidden md:flex cursor-pointer'
 *   }
 * ]
 *
 * // Desktop header with grid layout
 * <StandingsHeader
 *   columns={columns}
 *   isMobile={false}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 *   className="border-b"
 * />
 *
 * // Mobile header (automatically filters out desktop-only columns)
 * <StandingsHeader
 *   columns={columns}
 *   isMobile={true}
 *   className="px-4"
 * />
 * ```
 *
 * @see {@link Column} for column configuration options
 * @see {@link CardHeaderSortContent} for sortable header implementation
 * @see {@link SubTitle} for non-sortable header implementation
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
    /**
     * Filter columns based on responsive visibility requirements.
     * On mobile devices, exclude columns that have desktop-only CSS classes
     * to prevent empty header cells from appearing in the layout.
     */
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

    /**
     * Helper function to render individual header cells.
     * Chooses between sortable and non-sortable header components based on column configuration.
     *
     * @param col - Column configuration to render
     * @returns Appropriate header component (CardHeaderSortContent or SubTitle)
     */
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
                    tooltip={col.tooltip}
                >
                    {col.header as string}
                </SubTitle>
            )
        }
    }

    /**
     * CSS Grid layout - preferred for precise column alignment.
     * When gridTemplate is provided, use CSS Grid for exact column sizing
     * that matches the data rows for perfect alignment.
     */
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

    /**
     * Flexbox layout - fallback for backward compatibility.
     * Splits columns into left-aligned and right-aligned groups,
     * typically used when precise column alignment isn't required.
     */
    const leftColumns = visibleColumns.slice(0, 2)
    const rightColumns = visibleColumns.slice(2)

    return (
        <CardHeaderBase
            className={`flex flex-row justify-between  w-full ${className}`}
        >
            <div className="flex  gap-8">
                {leftColumns.map(renderHeaderCell)}
            </div>
            <div className="flex  md:gap-4 gap-2 flex-1 justify-end">
                {rightColumns.map(renderHeaderCell)}
            </div>
        </CardHeaderBase>
    )
}
