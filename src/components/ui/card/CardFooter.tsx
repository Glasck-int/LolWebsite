'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CardProps } from './Card'
import { motion } from 'framer-motion'
import { useLayout } from '@/components/layout/TableEntityLayout/TableEntityLayout'

/**
 * Renders a tabbed footer with an animated underline indicating the active tab.
 *
 * This component is used as a dynamic footer for cards, with tab-like clickable areas that
 * trigger an index update in shared layout state (`useLayout`). It calculates dimensions and
 * positions of tabs in order to animate an underline to reflect the currently active one.
 *
 * Uses ResizeObserver and window resize events to adapt to layout changes.
 *
 * @function CardFooter
 * 
 * @param {CardProps} props - React component props.
 * @param {ReactNode} props.children - Tab elements rendered as children.
 * @param {string} [props.className] - Optional class name for additional styling.
 *
 * @returns {JSX.Element} A footer element with tab items and animated underline.
 *
 * @example
 * <CardFooter>
 *   <div>Overview</div>
 *   <div>Stats</div>
 * </CardFooter>
 */
export const CardFooter = ({ children, className = '' }: CardProps) => {
    const { activeIndex, setActiveIndex } = useLayout()
    const containerRef = useRef<HTMLDivElement>(null)
    const [tabRects, setTabRects] = useState<{ width: number; left: number }[]>(
        []
    )

    const tabRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        if (!containerRef.current || tabRefs.current.length === 0) return

        const updateRects = () => {
            const containerRect = containerRef.current!.getBoundingClientRect()
            const rects = tabRefs.current.map((tab) => {
                if (!tab) return { width: 0, left: 0 }
                const { width, left } = tab.getBoundingClientRect()
                return {
                    width,
                    left: left - containerRect.left, // make it relative
                }
            })
            setTabRects(rects)
        }

        updateRects()

        const resizeObserver = new ResizeObserver(updateRects)
        tabRefs.current.forEach((tab) => {
            if (tab) resizeObserver.observe(tab)
        })

        window.addEventListener('resize', updateRects)

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('resize', updateRects)
        }
    }, [children])

    const activeTab = tabRects[activeIndex]
    const barWidth = activeTab?.width ? activeTab.width * 0.8 : 0
    const barLeft = activeTab?.left ? activeTab.left + activeTab.width * 0.1 : 0

    return (
        <div
            className={`w-full default-bot-border-radius text-sm color-grey bg-white-04 h-[45px] md:h-[50px] ${className}`}
        >
            <div
                ref={containerRef}
                className="relative flex items-center justify-between md:justify-start px-[15px] h-full gap-2"
            >
                <motion.div
                    className="absolute bottom-0 h-[3px] bg-clear-violet rounded-t-md"
                    animate={{
                        width: barWidth,
                        left: barLeft,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                    }}
                />
                {React.Children.map(children, (child, index) => {
                    if (!React.isValidElement(child))
                        return <div>ERROR IN CardFooter</div>

                    return (
                        <div
                            ref={(el) => {
                                tabRefs.current[index] = el
                            }}
                            className={`z-10 text-center cursor-pointer select-none px-2 py-2 transition-colors duration-100 
                                ${
                                    activeIndex === index
                                        ? 'text-white'
                                        : 'text-grey hover:text-clear-grey'
                                } 
                                flex-1 md:flex-none md:min-w-[150px]`}
                            onClick={() => setActiveIndex(index)}
                        >
                            {child}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/**
 * Simple wrapper component for footer content.
 *
 * This component wraps the inner content of a footer and applies full width/height styling.
 * It accepts an optional class name for additional customization.
 *
 * @function CardFooterContent
 * 
 * @param {CardProps} props - React component props.
 * @param {ReactNode} props.children - Content inside the footer.
 * @param {string} [props.className] - Optional class name for additional styling.
 *
 * @returns {JSX.Element} A styled div container for footer content.
 *
 * @example
 * <CardFooterContent className="p-4">Some extra info</CardFooterContent>
 */
export const CardFooterContent = ({ children, className = '' }: CardProps) => {
    return <div className={'w-full h-full' + ' ' + className}>{children}</div>
}
