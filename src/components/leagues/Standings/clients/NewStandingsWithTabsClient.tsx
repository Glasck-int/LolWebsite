'use client'

import React from 'react'
import { ProcessedStanding } from '../utils/StandingsDataProcessor'
import { StandingsWithTabs } from '../components/StandingsWithTabs'

interface NewStandingsWithTabsClientProps {
    /** Processed standings data */
    processedData: ProcessedStanding[]
    /** Optional team name to highlight */
    highlightedTeam?: string
    /** Optional maximum number of rows to display */
    maxRows?: number | null
}

/**
 * New simplified standings client component.
 * Replaces the complex 450+ line component with a clean, maintainable solution.
 * 
 * Key improvements:
 * - Uses semantic HTML tables instead of CSS Grid
 * - ~90% less code than the original
 * - Better accessibility and screen reader support
 * - Automatic responsive behavior
 * - Cleaner separation of concerns
 */
export const NewStandingsWithTabsClient: React.FC<NewStandingsWithTabsClientProps> = ({
    processedData,
    highlightedTeam,
    maxRows
}) => {
    if (!processedData?.length) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                Aucune donnée de classement disponible
            </div>
        )
    }

    return (
        <StandingsWithTabs
            processedData={processedData}
            highlightedTeam={highlightedTeam}
            maxRows={maxRows}
        />
    )
}