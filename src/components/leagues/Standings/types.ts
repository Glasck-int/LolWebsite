import { ReactNode } from 'react'

/**
 * Column configuration interface for standings table components.
 *
 * This interface defines the structure for configuring table columns in the standings system,
 * including headers, cell renderers, styling, and sorting capabilities. Each column represents
 * a specific data field or computed value that can be displayed in the standings table.
 *
 * @template T - The type of data item that will be passed to the cell renderer function.
 *               Typically ProcessedStanding or ProcessedGameStats from StandingsDataProcessor.
 *
 * @example
 * ```tsx
 * const columns: Column<ProcessedStanding>[] = [
 *   {
 *     key: 'place',
 *     header: '#',
 *     cell: ({ standing }, sortedPosition) => <span>{sortedPosition ?? standing.place}</span>,
 *     tooltip: 'Team ranking position',
 *     sortable: true,
 *     className: 'text-center',
 *     headerClassName: 'cursor-pointer'
 *   },
 *   {
 *     key: 'team',
 *     header: 'Team',
 *     cell: ({ standing }) => <span>{standing.team}</span>,
 *     sortable: false
 *   }
 * ]
 * ```
 */
export interface Column<T> {
    /**
     * Unique identifier for the column.
     * Used for sorting operations, CSS grid templates, and React keys.
     * Should match the data property being displayed (e.g., 'place', 'team', 'wins').
     */
    key: string

    /**
     * Header content to display in the column header.
     * Can be a string, React component, or any ReactNode.
     * If not provided, the column will render without a visible header.
     */
    header?: ReactNode

    /**
     * Tooltip text to show when hovering over the column header.
     * Provides additional context or explanation about the column data.
     * Only displayed if a header is present.
     */
    tooltip?: string

    /**
     * Function to render the cell content for each data row.
     * 
     * @param props - The data item for this row (ProcessedStanding or ProcessedGameStats)
     * @param sortedPosition - Optional position number based on current sort order (1-indexed).
     *                        When provided, overrides the original position for display purposes.
     *                        Useful for showing dynamic rankings based on different sort criteria.
     * @returns ReactNode to render in the table cell
     * 
     * @example
     * ```tsx
     * // Simple text cell
     * cell: ({ standing }) => <span>{standing.team}</span>
     * 
     * // Cell using sorted position
     * cell: ({ standing }, sortedPosition) => <span>{sortedPosition ?? standing.place}</span>
     * 
     * // Complex cell with multiple elements
     * cell: ({ standing, teamImage }) => (
     *   <div className="flex items-center gap-2">
     *     <img src={teamImage} alt={standing.team} />
     *     <span>{standing.team}</span>
     *   </div>
     * )
     * ```
     */
    cell?: (props: T, sortedPosition?: number) => ReactNode

    /**
     * CSS classes to apply to all cells in this column.
     * Used for styling individual cells, including alignment, spacing, and responsive behavior.
     * Applied in addition to any base cell styling from the row component.
     */
    className?: string

    /**
     * CSS classes to apply specifically to the column header.
     * Used for header-specific styling like cursor changes for sortable columns,
     * alignment adjustments, or hover states.
     */
    headerClassName?: string

    /**
     * Whether this column supports sorting functionality.
     * When true, the column header becomes clickable and will trigger sort operations.
     * The sorting logic is handled by the parent component using the useSort hook.
     * 
     * @default false
     */
    sortable?: boolean
}
