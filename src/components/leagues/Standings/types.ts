import { ReactNode } from 'react'

/**
 * Column configuration interface for standings table.
 *
 * Defines the structure for configuring table columns with headers, tooltips, and cell renderers.
 * Supports both sortable and non-sortable columns.
 *
 * @template T - The type of data item that will be passed to the cell renderer
 */
export interface Column<T> {
    /** Unique identifier for the column */
    key: string
    /** Header text or component to display in the column header */
    header?: ReactNode
    /** Tooltip text to show when hovering over the column header */
    tooltip?: string
    /** Function to render the cell content for each row */
    cell?: (props: T) => ReactNode
    /** CSS classes to apply to the column cells */
    className?: string
    /** CSS classes to apply to the column header */
    headerClassName?: string
    /** Whether this column is sortable (defaults to false) */
    sortable?: boolean
}
