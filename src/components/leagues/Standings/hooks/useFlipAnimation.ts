'use client'
import { useLayoutEffect, useRef, useState } from 'react'
import {
    ProcessedStanding,
    ProcessedGameStats,
} from '../utils/StandingsDataProcessor'

// Import the SortState type from the card module
type SortDirection = 'asc' | 'desc' | null

type SortState = {
    key: string | null
    direction: SortDirection
}

/**
 * Custom hook that implements FLIP (First, Last, Invert, Play) animation for smooth transitions.
 *
 * This hook provides smooth animations when list items change position, such as when
 * standings are re-sorted. It tracks the previous positions of elements identified by
 * `data-team-key` attributes and animates them smoothly to their new positions using
 * CSS transforms.
 *
 * The FLIP technique works by:
 * 1. **First**: Record the initial positions of elements
 * 2. **Last**: Allow elements to move to their final positions
 * 3. **Invert**: Use CSS transforms to move elements back to their original positions
 * 4. **Play**: Animate the transforms back to 0, creating smooth movement
 *
 * @param activeSort - Current sort state that triggers animation when changed
 * @param processedData - Array of processed standings or game statistics data
 *
 * @returns Object containing container ref and animation state
 * @returns containerRef - Ref to attach to the container element holding animated items
 * @returns isAnimating - Boolean indicating whether animation is currently in progress
 *
 * @example
 * ```tsx
 * const { containerRef, isAnimating } = useFlipAnimation(activeSort, processedData);
 *
 * return (
 *   <div ref={containerRef} className="standings-container">
 *     {sortedData.map((item) => (
 *       <div key={item.team} data-team-key={item.team}>
 *         {/* Item content *\/}
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @see {@link https://aerotwist.com/blog/flip-your-animations/} FLIP animation technique
 */
export const useFlipAnimation = (
    activeSort: SortState,
    processedData: (ProcessedStanding | ProcessedGameStats)[]
) => {
    /** Reference to the container element that holds the animated items */
    const containerRef = useRef<HTMLDivElement>(null)

    /** State to track whether an animation is currently playing */
    const [isAnimating, setIsAnimating] = useState(false)

    /** Map storing previous positions of elements keyed by their team identifier */
    const prevPositions = useRef<Map<string, { top: number; height: number }>>(
        new Map()
    )

    useLayoutEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const items = Array.from(container.querySelectorAll('[data-team-key]'))

        // Batch DOM reads to avoid layout thrashing
        const containerRect = container.getBoundingClientRect()

        /**
         * First render: Store initial positions without animating.
         * This establishes the baseline for future animations.
         */
        if (prevPositions.current.size === 0) {
            items.forEach((item) => {
                const teamKey = item.getAttribute('data-team-key')
                if (teamKey) {
                    const rect = item.getBoundingClientRect()
                    prevPositions.current.set(teamKey, {
                        top: rect.top - containerRect.top,
                        height: rect.height,
                    })
                }
            })
            return
        }

        /**
         * Calculate position differences and prepare animations.
         * Only items that moved significantly will be animated.
         */
        const animations: { element: Element; deltaY: number }[] = []

        // Batch all DOM reads first
        const currentPositions = items
            .map((item) => {
                const teamKey = item.getAttribute('data-team-key')
                if (!teamKey) return null

                const rect = item.getBoundingClientRect()
                return {
                    element: item,
                    teamKey,
                    top: rect.top - containerRect.top,
                    height: rect.height,
                }
            })
            .filter(Boolean)

        // Then calculate animations
        currentPositions.forEach((current) => {
            if (!current) return

            const prevPosition = prevPositions.current.get(current.teamKey)
            if (prevPosition) {
                const deltaY = prevPosition.top - current.top

                // Only animate if there's significant movement (> 1px)
                if (Math.abs(deltaY) > 1) {
                    animations.push({ element: current.element, deltaY })
                }
            }

            // Update stored position for next animation cycle
            prevPositions.current.set(current.teamKey, {
                top: current.top,
                height: current.height,
            })
        })

        /**
         * Execute FLIP animation if any elements need to move.
         * This implements the Invert and Play phases of FLIP.
         */
        if (animations.length > 0) {
            setIsAnimating(true)

            // INVERT: Apply initial transforms (simplified for performance)
            animations.forEach(({ element, deltaY }) => {
                const htmlElement = element as HTMLElement
                htmlElement.style.transform = `translateY(${deltaY}px)`
                htmlElement.style.transition = 'none'
            })

            // Use requestAnimationFrame instead of setTimeout for better performance
            requestAnimationFrame(() => {
                // PLAY: Animate transforms back to 0
                animations.forEach(({ element }) => {
                    const htmlElement = element as HTMLElement
                    htmlElement.style.transform = 'translateY(0px)'
                    htmlElement.style.transition =
                        'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                })

                /**
                 * Clean up animation styles after completion.
                 * This prevents interference with future layouts and animations.
                 */
                const cleanup = () => {
                    animations.forEach(({ element }) => {
                        const htmlElement = element as HTMLElement
                        htmlElement.style.transition = ''
                        htmlElement.style.transform = ''
                    })
                    setIsAnimating(false)
                }

                // Use single timeout for cleanup
                const timer = setTimeout(cleanup, 300)
                return () => clearTimeout(timer)
            })
        }
    }, [activeSort, processedData])

    return { containerRef, isAnimating }
}
