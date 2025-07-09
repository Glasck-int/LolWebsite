import React from 'react'
import { Column } from './types'

/**
 * Standings table row component.
 *
 * Renders a single row in the standings table with team data and statistics.
 * Splits columns into left and right sections for responsive layout.
 * Supports highlighting for specific teams.
 * Handles responsive column visibility to avoid empty spaces.
 *
 * @template T - The type of data item containing team and standings information
 * @param item - The data item containing team and standings information
 * @param columns - Array of column configurations defining cell renderers and styling
 * @param isHighlighted - Whether this row should be highlighted (e.g., for user's favorite team)
 * @returns A table row component with team data and statistics
 *
 * @example
 * ```tsx
 * const columns: Column<ProcessedStanding>[] = [
 *   { key: 'place', cell: ({ standing }) => <p>{standing.place}</p> },
 *   { key: 'team', cell: ({ standing }) => <p>{standing.team}</p> }
 * ]
 *
 * <StandingsRow
 *   item={processedStanding}
 *   columns={columns}
 *   isHighlighted={true}
 * />
 * ```
 */
export const StandingsRow = <T,>({
    item,
    columns,
    isHighlighted = false,
}: {
    item: T
    columns: Column<T>[]
    isHighlighted?: boolean
}) => {
    const leftColumns = columns.slice(0, 2)
    const rightColumns = columns.slice(2)

    return (
        <div
            className={`flex items-center justify-between w-full h-[45px] transition-colors duration-200 cursor-pointer px-[15px] ${
                isHighlighted
                    ? 'bg-grey/10 hover:bg-grey/20'
                    : 'hover:bg-grey/10'
            }`}
        >
            <div className="flex items-center gap-8">
                {leftColumns.map((col) => (
                    <div key={col.key} className={col.className}>
                        {col.cell && col.cell(item)}
                    </div>
                ))}
            </div>
            <div className="flex items-center md:gap-4 gap-2 flex-1 justify-end">
                {rightColumns.map((col) => (
                    <div key={col.key} className={col.className}>
                        {col.cell && col.cell(item)}
                    </div>
                ))}
            </div>
        </div>
    )
}
