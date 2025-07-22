'use client'

import React from 'react'

export interface FlexColumnProps {
    children: React.ReactNode
    className?: string
}

/**
 * Vertical flex container component.
 *
 * Renders children in a vertical column layout using CSS flexbox.
 * Designed to be used inside Card components for content organization.
 *
 * @param children - Elements to display in the column
 * @param className - Optional Tailwind CSS classes for styling (gap, justify, align, etc.)
 * @returns A vertical flex container
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardHeaderBase>Title</CardHeaderBase>
 *   </CardHeader>
 *   <CardBody>
 *     <FlexColumn className="gap-4 justify-center items-stretch">
 *       <div>Top content</div>
 *       <div>Middle content</div>
 *       <div>Bottom content</div>
 *     </FlexColumn>
 *   </CardBody>
 * </Card>
 * ```
 *
 * @example
 * ```tsx
 * // Nested layout with mixed directions
 * <FlexColumn className="gap-6 p-4">
 *   <FlexRow className="justify-between">
 *     <h2>Dashboard</h2>
 *     <button>Settings</button>
 *   </FlexRow>
 *   <FlexColumn className="gap-4">
 *     <div>Widget 1</div>
 *     <div>Widget 2</div>
 *     <FlexRow className="gap-2">
 *       <button>Save</button>
 *       <button>Cancel</button>
 *     </FlexRow>
 *   </FlexColumn>
 * </FlexColumn>
 * ```
 *
 * @remarks
 * Common className patterns:
 * - Gap: `gap-2`, `gap-4`, `gap-6`, `gap-8`
 * - Justify: `justify-start`, `justify-center`, `justify-end`, `justify-between`, `justify-around`, `justify-evenly`
 * - Align: `items-start`, `items-center`, `items-end`, `items-stretch`
 * - Height: `h-full`, `min-h-0`, `grow`
 */
export const FlexColumn = ({ children, className = '' }: FlexColumnProps) => {
    return (
        <div className={`flex flex-col ${className}`}>
            {children}
        </div>
    )
}