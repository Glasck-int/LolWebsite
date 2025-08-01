'use client'

import React from 'react'
import { SortableTable } from '@/components/ui/table'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'
import { useStandingsTableColumns, useCombinedStandingsTableColumns, StandingsTableConfig } from '../hooks/useStandingsTableColumns'

interface StandingsTableProps {
    /** Processed standings data */
    data: ProcessedStanding[]
    /** Table configuration */
    config: StandingsTableConfig
    /** Optional team name to highlight */
    highlightedTeam?: string
    /** Optional CSS class for table container */
    className?: string
    /** Optional maximum number of rows to display */
    maxRows?: number | null
}

/**
 * Simple standings table component using the new table system.
 * Replaces the complex CSS Grid implementation with semantic HTML tables.
 */
export const StandingsTable: React.FC<StandingsTableProps> = ({
    data,
    config,
    highlightedTeam,
    className,
    maxRows
}) => {
    const columns = useStandingsTableColumns(config)
    
    // Apply row limit if specified
    const displayData = maxRows ? data.slice(0, maxRows) : data
    
    // Function to determine if a row should be highlighted
    const isRowHighlighted = (item: ProcessedStanding) => {
        return Boolean(highlightedTeam && item.standing.team === highlightedTeam)
    }

    return (
        <SortableTable
            data={displayData}
            columns={columns}
            isRowHighlighted={isRowHighlighted}
            className={className}
            caption={`Classement ${config.type === 'matches' ? 'des matches' : 'des jeux'}`}
            getRowKey={(item) => item.standing.team}
        />
    )
}

interface CombinedStandingsTableProps {
    /** Processed standings data */
    data: ProcessedStanding[]
    /** Optional group name for header */
    groupName?: string
    /** Optional team name to highlight */
    highlightedTeam?: string
    /** Optional CSS class for table container */
    className?: string
    /** Optional maximum number of rows to display */
    maxRows?: number | null
    /** Whether columns should be sortable */
    sortable?: boolean
    /** Whether to show section headers (MATCHES/GAMES) */
    showSectionHeaders?: boolean
}

/**
 * Combined standings table showing both matches and games statistics.
 * Uses the new table system for better accessibility and maintainability.
 */
export const CombinedStandingsTable: React.FC<CombinedStandingsTableProps> = ({
    data,
    groupName,
    highlightedTeam,
    className,
    maxRows,
    sortable = true,
    showSectionHeaders = true
}) => {
    const columns = useCombinedStandingsTableColumns({ groupName, sortable })
    
    // Apply row limit if specified
    const displayData = maxRows ? data.slice(0, maxRows) : data
    
    // Function to determine if a row should be highlighted
    const isRowHighlighted = (item: ProcessedStanding) => {
        return Boolean(highlightedTeam && item.standing.team === highlightedTeam)
    }

    return (
        <SortableTable
            data={displayData}
            columns={columns}
            isRowHighlighted={isRowHighlighted}
            className={className}
            caption="Classement combiné des matches et jeux"
            showSectionHeaders={showSectionHeaders}
            getRowKey={(item) => item.standing.team}
        />
    )
}