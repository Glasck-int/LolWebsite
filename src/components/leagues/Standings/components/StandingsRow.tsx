import React from 'react'
import { Column } from '../types'
import { getColumnBackgroundClass } from '../hooks/useStandingsColumns'

/**
 * Standings table row component that renders a single data row with team statistics.
 *
 * This component displays a single row of standings data, rendering each column according
 * to its configuration. It supports dynamic position display based on current sort order,
 * visual highlighting for specific teams, and maintains consistent styling with the header
 * component through shared grid layouts.
 *
 * The component integrates with the sorting system by accepting a sortedPosition parameter
 * that overrides the original position when displaying rankings based on different sort criteria.
 * Each cell is rendered using the column's cell function and can display different background
 * colors based on the column type.
 *
 * @template T - The type of data item containing team and standings information
 *               (typically ProcessedStanding or ProcessedGameStats)
 *
 * @param props - Component properties
 * @param props.item - The data item containing team and standings information.
 *                    Contains all the raw data needed by column cell renderers.
 * @param props.columns - Array of column configurations defining cell renderers and styling.
 *                       Each column specifies how to render its data and apply styling.
 * @param props.isHighlighted - Whether this row should be visually highlighted.
 *                             Typically used to emphasize a user's favorite team or search results.
 *                             Applies special background colors and border styling.
 * @param props.gridTemplate - CSS Grid template string for column layout.
 *                            Must match the header's grid template for proper alignment.
 *                            When null, falls back to default grid behavior.
 * @param props.className - Additional CSS classes to apply to the row container.
 *                         Combined with base row styling for customization.
 * @param props.sortedPosition - Optional position number based on current sort order (1-indexed).
 *                             When provided, this value is passed to column cell renderers
 *                             to display dynamic rankings instead of original positions.
 *
 * @returns A styled table row component with team data and statistics
 *
 * @example
 * ```tsx
 * // Basic row with team data
 * const columns: Column<ProcessedStanding>[] = [
 *   {
 *     key: 'place',
 *     cell: ({ standing }, sortedPosition) => (
 *       <span>{sortedPosition ?? standing.place}</span>
 *     )
 *   },
 *   {
 *     key: 'team',
 *     cell: ({ standing, teamImage }) => (
 *       <div className="flex items-center gap-2">
 *         <img src={teamImage} alt={standing.team} />
 *         <span>{standing.team}</span>
 *       </div>
 *     )
 *   },
 *   {
 *     key: 'wins',
 *     cell: ({ standing }) => <span>{standing.winSeries}</span>
 *   }
 * ]
 *
 * // Standard row
 * <StandingsRow
 *   item={processedStanding}
 *   columns={columns}
 *   isHighlighted={false}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 *   className="border-b"
 * />
 *
 * // Highlighted row with sorted position
 * <StandingsRow
 *   item={processedStanding}
 *   columns={columns}
 *   isHighlighted={true}
 *   gridTemplate="50px 1fr 60px 60px 80px"
 *   sortedPosition={3}
 *   className="border-b"
 * />
 * ```
 *
 * @see {@link Column} for column configuration options
 * @see {@link getColumnBackgroundClass} for background styling logic
 * @see {@link StandingsHeader} for corresponding header component
 */
export const StandingsRow = <T,>({
    item,
    columns,
    isHighlighted = false,
    gridTemplate,
    className,
    sortedPosition,
}: {
    item: T
    columns: Column<T>[]
    isHighlighted?: boolean
    gridTemplate: string | null
    className?: string
    sortedPosition?: number
}) => {
    return (
        <div
            className={`grid w-full items-center h-[45px] transition-colors duration-200 cursor-pointer px-[14px] ${
                isHighlighted
                    ? 'bg-grey/20 hover:bg-grey/20 border-t-1 border-b-1 border-grey/20'
                    : 'hover:bg-grey/10'
            } ${className}`}
            style={{
                gridTemplateColumns: gridTemplate ?? undefined,
            }}
        >
            {columns.map((col) => {
                /**
                 * Apply column-specific background styling based on column type.
                 * Some columns may have special background colors for visual distinction.
                 */
                const backgroundClass = getColumnBackgroundClass(col.key)
                
                return (
                    <div 
                        key={col.key} 
                        className={`${col.className} ${backgroundClass} h-full flex items-center justify-center px-2`}
                    >
                        {col.cell && col.cell(item, sortedPosition)}
                    </div>
                )
            })}
        </div>
    )
}
