'use client'

import React from 'react'
import { CardProps, useCard } from './Card'

/**
 * Main body container for a Card.
 *
 * Provides a flexible layout for the card’s inner content.
 *
 * @param children - Content to render inside the card body
 * @param className - Optional custom styles to apply to the wrapper
 * @returns A flex container wrapping the children
 *
 * @example
 * ```tsx
 * <CardBody className="p-4">
 *   <p>My card content</p>
 * </CardBody>
 * ```
 */
export const CardBody = ({ children, className = '' }: CardProps) => {
    return <div className={`flex grow-1 ${className ?? ''}`}>{children}</div>
}

/**
 * Conditional renderer for multiple card bodies.
 *
 * Displays only the body that matches the `activeIndex` from `useCard`.
 *
 * @param children - Multiple body views, typically wrapped in `CardBodyMultipleContent`
 * @returns Only the active child is rendered
 *
 * @example
 * ```tsx
 * <CardBodyMultiple>
 *   <CardBodyMultipleContent>
 *     <p>View A</p>
 *   </CardBodyMultipleContent>
 *   <CardBodyMultipleContent>
 *     <p>View B</p>
 *   </CardBodyMultipleContent>
 * </CardBodyMultiple>
 * ```
 *
 * @remarks
 * Must be used within a `Card` component that provides `useCard()` context.
 *
 * @see useCard
 */
export const CardBodyMultiple = ({ children }: CardProps) => {
    const { activeIndex } = useCard()
    return (
        <div className="h-full w-full">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    if (index == activeIndex) {
                        return (
                            <CardBodyMultipleDiv>{child}</CardBodyMultipleDiv>
                        )
                    } else {
                        return null
                    }
                }
                return <div>ERROR IN CardBodyMultiple</div>
            })}
        </div>
    )
}

/**
 * Internal wrapper for active content in `CardBodyMultiple`.
 *
 * Used internally to render the selected child based on `activeIndex`.
 *
 * @param children - The active content
 * @returns A full-width, full-height container
 */
const CardBodyMultipleDiv = ({ children }: CardProps) => {
    return <div className="h-full w-full">{children}</div>
}

/**
 * Wrapper for a single view inside `CardBodyMultiple`.
 *
 * Should be used to wrap each child passed into `CardBodyMultiple`.
 *
 * @param children - Content for the current view
 * @param className - Optional styles
 * @returns A full-size div wrapping the content
 *
 * @example
 * ```tsx
 * <CardBodyMultipleContent>
 *   <p>Tab panel content</p>
 * </CardBodyMultipleContent>
 * ```
 */
export const CardBodyMultipleContent = ({
    children,
    className = '',
}: CardProps) => {
    return <div className={'w-full h-full' + ' ' + className}>{children}</div>
}
