'use client'

import React from 'react'

export interface FlexRowProps {
    children: React.ReactNode
    className?: string
}

/**
 * Horizontal flex container component.
 *
 * Renders children in a horizontal row layout using CSS flexbox.
 * Designed to be used inside Card components for content organization.
 *
 * @param children - Elements to display in the row
 * @param className - Optional Tailwind CSS classes for styling (gap, justify, align, etc.)
 * @returns A horizontal flex container
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardHeaderBase>Title</CardHeaderBase>
 *   </CardHeader>
 *   <CardBody>
 *     <FlexRow className="gap-4 justify-between items-center">
 *       <div>Left content</div>
 *       <div>Right content</div>
 *     </FlexRow>
 *   </CardBody>
 * </Card>
 * ```
 *
 * @example
 * ```tsx
 * // Nested layout
 * <FlexColumn className="gap-6">
 *   <FlexRow className="justify-between">
 *     <h2>Section Title</h2>
 *     <button>Action</button>
 *   </FlexRow>
 *   <FlexRow className="gap-4 flex-wrap">
 *     <div>Item 1</div>
 *     <div>Item 2</div>
 *     <div>Item 3</div>
 *   </FlexRow>
 * </FlexColumn>
 * ```
 *
 * @remarks
 * Common className patterns:
 * - Gap: `gap-2`, `gap-4`, `gap-6`, `gap-8`
 * - Justify: `justify-start`, `justify-center`, `justify-end`, `justify-between`, `justify-around`, `justify-evenly`
 * - Align: `items-start`, `items-center`, `items-end`, `items-stretch`
 * - Wrap: `flex-wrap`, `flex-nowrap`
 */
export const FlexRow = ({ children, className = '' }: FlexRowProps) => {
    return (
        <div className={`flex flex-row ${className}`}>
            {children}
        </div>
    )
}