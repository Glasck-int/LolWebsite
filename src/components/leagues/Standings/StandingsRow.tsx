import React from 'react'
import { Column } from './types'

/**
 * Standings table row component.
 *
 * Renders a single row in the standings table with team data and statistics.
 * Uses the same layout structure as the header for consistent column sizing.
 * Supports highlighting for specific teams.
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
    gridTemplate, // <-- nouveau prop
}: {
    item: T
    columns: Column<T>[]
    isHighlighted?: boolean
    gridTemplate: string | null
}) => {
    return (
        <div
            className={`grid w-full items-center h-[45px] transition-colors duration-200 cursor-pointer px-[15px] ${
                isHighlighted
                    ? 'bg-grey/20 hover:bg-grey/20 border-t-1 border-b-1 border-grey/20'
                    : 'hover:bg-grey/10'
            }`}
            style={{
                gridTemplateColumns: gridTemplate ?? undefined,
            }}
        >
            {columns.map((col) => (
                <div key={col.key} className={col.className}>
                    {col.cell && col.cell(item)}
                </div>
            ))}
        </div>
    )
}
