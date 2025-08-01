'use client'

import React from 'react'
import { ChildAndClassname, useCard } from './Card'
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



/**
* Animated body container for a Card component.
*
* Provides a flexible layout with smooth show/hide animations based on the card's visibility state.
* The component automatically handles entry/exit animations with opacity and height transitions.
* 
* - On first render: appears without animation
* - On show: animates in with height expansion followed by opacity fade-in
* - On hide: animates out with opacity fade-out followed by height collapse
*
* @param children - Content to render inside the card body
* @param className - Optional custom styles to apply to the wrapper
* @returns An animated flex container wrapping the children, or null when hidden
*
* @example
* ```tsx
* <Card>
*   <CardHeader />
*   <CardBody className="p-4">
*     <p>My card content</p>
*   </CardBody>
* </Card>
* ```
* 
* @dependencies framer-motion for animations
* @remarks 
* - IF HIDE animation : Do not override `height` or `opacity` styles in className as they will be overridden by animations
* - The component manages these properties internally for smooth transitions
*/

export const CardBody = ({ children, className = '' }: ChildAndClassname) => {
    const hasBeenToggled = useRef(false);
    
    // Try to get context, but don't fail if it doesn't exist
    let isHide = false;
    try {
        const context = useCard();
        isHide = context.isHide;
    } catch {
        // No context available, render as a simple div
        return (
            <div className={`flex grow-1 ${className ?? ''}`}>
                {children}
            </div>
        );
    }
    
    if (isHide) {
        hasBeenToggled.current = true;
    }
    
    return (
        <AnimatePresence>
            {!isHide && (
                <motion.div
                    className={`flex grow-1 ${className ?? ''}`}
                    initial={hasBeenToggled.current ? 
                        { height: 0, opacity: 0 } : 
                        { height: 'auto', opacity: 1 }
                    }
                    animate={{ 
                        height: 'auto', 
                        opacity: 1,
                    }}
                    exit={{ 
                        opacity: 0,
                        height: 0,
                    }}
                    transition={{
                        duration: 0.7,
                        ease: "easeOut",
                        opacity: { duration: 0.2 },
                        height: { delay: 0.2 },
                    }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
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
export const CardBodyMultiple = ({ children }: ChildAndClassname) => {
    let activeIndex = 0;
    try {
        const context = useCard();
        activeIndex = context.activeIndex;
    } catch {
        // No context available, show first child by default
        activeIndex = 0;
    }
    
    return (
        <div className="h-full w-full">
                {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child)) {
                        if (index === activeIndex) {
                            return <CardBodyMultipleDiv>{child}</CardBodyMultipleDiv>
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
const CardBodyMultipleDiv = ({ children }: ChildAndClassname) => {
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
}: ChildAndClassname) => {
    return <div className={'w-full h-full' + ' ' + className}>{children}</div>
}
