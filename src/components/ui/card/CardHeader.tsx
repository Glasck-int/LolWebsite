'use client'

import React from 'react'
import { CardProps, useCard } from './Card'
import { motion } from 'framer-motion'

// Components

/**
 * Basic header wrapper component with default styling.
 *
 * Renders a horizontal flex container for header content, with predefined border and text styles.
 *
 * @param children - Elements to display inside the header
 * @param className - Optional additional class names
 * @returns A styled header container
 *
 *
 * @see CardHeaderBase
 */
export const CardHeader = ({ children, className = '' }: CardProps) => {
    return (
        <div
            className={`w-full default-top-border-radius text-sm color-grey flex items-center ${className}`}
        >
            {children}
        </div>
    )
}

/**
 * Header container with base layout and background.
 *
 * @param children - Content to render inside the header
 * @param className - Optional additional class names
 * @returns A styled header base container
 *
 * @example
 * ```tsx
 * <CardHeaderBase>Title</CardHeaderBase>
 * ```
 */
export const CardHeaderBase = ({ children, style, className = '' }: { children: React.ReactNode, style?: React.CSSProperties, className?: string }) => {
    return (
        <div
            className={
                'content-center min-h-[35px] md:min-h-[40px] w-full flex items-center px-[14px] h-full bg-white-04' +
                ' ' +
                className
            }
            style={style}
        >
            {children}
        </div>
    )
}

/**
 * Header component to display and control tab-like selection.
 *
 * Each child element becomes a clickable selector. Active item is highlighted using color.
 * Requires to be used inside a `Card` that provides `useCard()` context.
 *
 * @param children - Selector items (usually text or icons)
 * @param className - Optional class names
 * @returns A clickable row of selectable items
 *
 * @throws Error - If `useCard` context is not available
 *
 * @example
 * ```tsx
 * <CardHeaderSelector>
 *   <div>Tab 1</div>
 *   <div>Tab 2</div>
 * </CardHeaderSelector>
 * ```
 *
 * @see useCard
 */
export const CardHeaderSelector = ({ children }: CardProps) => {
    const { activeIndex, setActiveIndex } = useCard()

    return (
        <div className="flex ">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return (
                        <div
                            className={` cursor-pointer select-none ${
                                activeIndex === index
                                    ? 'text-white'
                                    : 'text-grey hover:text-clear-grey'
                            }`}
                            onClick={() => setActiveIndex(index)}
                        >
                            {child}
                        </div>
                    )
                }
                return <div>ERROR IN CardHeaderTab</div>
            })}
        </div>
    )
}

/**
 * Column layout container for header components.
 *
 * Renders children in a vertical flex layout, spanning full width.
 *
 * @param children - Content to stack vertically
 * @param className - Optional class names
 * @returns A vertically stacked header layout
 *
 * @example
 * ```tsx
 * <CardHeaderColumn>
 *   <CardHeader>Top</CardHeader>
 *   <CardHeaderContent>Bottom</CardHeaderContent>
 * </CardHeaderColumn>
 * ```
 */
export const CardHeaderColumn = ({ children, className = '' }: CardProps) => {
    return (
        <div className={'flex flex-col w-full' + ' ' + className}>
            {children}
        </div>
    )
}

/**
 * Animated tab component for headers.
 *
 * Displays children as clickable tabs with animated slider using `framer-motion`.
 * Updates active index from `useCard` context.
 *
 * @param children - Tab items to render
 * @param className - Optional class names for individual tab buttons
 * @returns A full-width animated tab switcher
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <CardHeaderColumn>
 *     <CardHeaderTab>
 *       <CardHeaderContent>
 *         <p className="text-inherit">Tab 1</p>
 *       </CardHeaderContent>
 *       <CardHeaderContent>
 *         <p className="text-inherit">Tab 2</p>
 *       </CardHeaderContent>
 *       <CardHeaderContent>
 *         <p className="text-inherit">Tab 3</p>
 *       </CardHeaderContent>
 *     </CardHeaderTab>
 *     <CardHeaderBase>
 *       <SubTitle>My Header Title</SubTitle>
 *     </CardHeaderBase>
 *   </CardHeaderColumn>
 * </CardHeader>
 * ```
 *
 * @remarks
 * Includes an animated background to highlight the active tab.
 * Each tab is equally distributed horizontally.
 *
 * @see useCard
 * @see framer-motion
 */
export const CardHeaderTab = ({ children, className = '' }: CardProps) => {
    const { activeIndex, setActiveIndex } = useCard()
    const tabCount = React.Children.count(children)
    const tabWidth = 100 / tabCount

    return (
        <div
            className={
                'relative w-full flex items-stretch justify-evenly content-center min-h-[42px] md:min-h-[45px]' +
                ' ' +
                className
            }
        >
            {/* Slider anim */}
            <motion.div
                className="absolute bottom-0 top-0 left-0 bg-white-04 default-top-border-radius z-0"
                layout
                initial={false}
                animate={{
                    transform: `translateX(${100 * activeIndex}%)`,
                    width: `${tabWidth}%`,
                }}
                transition={{
                    type: 'tween',
                    ease: 'easeOut', // Ou 'easeOut', 'linear' selon le ressenti
                    duration: 0.15, // Ajuste pour + rapide ou + lent
                }}
            />

            {/* Tabs */}
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return (
                        <div
                            className={`z-10 flex-1 text-center cursor-pointer select-none px-2 py-2 transition-colors duration-100 ${
                                activeIndex === index
                                    ? 'text-white'
                                    : 'text-grey hover:text-clear-grey'
                            } ${className ?? ''}`}
                            onClick={() => setActiveIndex(index)}
                        >
                            {child}
                        </div>
                    )
                }
                return <div>ERROR IN CardHeaderTab</div>
            })}
        </div>
    )
}

/**
 * Generic container for header content.
 *
 * Wraps children in a full-size div with optional styling.
 *
 * @param children - The content inside the header section
 * @param className - Optional custom styles
 * @returns A flexible container for header content
 *
 * @example
 * ```tsx
 * <CardHeaderContent>
 *   <YourContentHere />
 * </CardHeaderContent>
 * ```
 *
 * @remarks
 * Used to isolate dynamic or context-driven content within headers.
 */
export const CardHeaderContent = ({ children, className = '' }: CardProps) => {
    return <div className={'w-full h-full' + ' ' + className}>{children}</div>
}
