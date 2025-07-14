'use client'
import { useLayoutEffect, useRef, useState } from 'react'

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
 * @param dependencies - Array of values that trigger animation when changed.
 *                      Typically includes sort state and data array.
 * 
 * @returns Object containing container ref and animation state
 * @returns containerRef - Ref to attach to the container element holding animated items
 * @returns isAnimating - Boolean indicating whether animation is currently in progress
 * 
 * @example
 * ```tsx
 * const { containerRef, isAnimating } = useFlipAnimation([activeSort, processedData]);
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
export const useFlipAnimation = (dependencies: any[]) => {
    /** Reference to the container element that holds the animated items */
    const containerRef = useRef<HTMLDivElement>(null)
    
    /** State to track whether an animation is currently playing */
    const [isAnimating, setIsAnimating] = useState(false)
    
    /** Map storing previous positions of elements keyed by their team identifier */
    const prevPositions = useRef<Map<string, { top: number; height: number }>>(new Map())

    useLayoutEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const items = container.querySelectorAll('[data-team-key]')
        
        /**
         * First render: Store initial positions without animating.
         * This establishes the baseline for future animations.
         */
        if (prevPositions.current.size === 0) {
            items.forEach((item) => {
                const teamKey = item.getAttribute('data-team-key')
                if (teamKey) {
                    const rect = item.getBoundingClientRect()
                    const containerRect = container.getBoundingClientRect()
                    prevPositions.current.set(teamKey, {
                        top: rect.top - containerRect.top,
                        height: rect.height
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
        
        items.forEach((item) => {
            const teamKey = item.getAttribute('data-team-key')
            if (!teamKey) return

            const currentRect = item.getBoundingClientRect()
            const containerRect = container.getBoundingClientRect()
            const currentTop = currentRect.top - containerRect.top

            const prevPosition = prevPositions.current.get(teamKey)
            if (prevPosition) {
                const deltaY = prevPosition.top - currentTop
                
                // Only animate if there's significant movement (> 1px)
                if (Math.abs(deltaY) > 1) {
                    animations.push({ element: item, deltaY })
                }
            }

            // Update stored position for next animation cycle
            prevPositions.current.set(teamKey, {
                top: currentTop,
                height: currentRect.height
            })
        })

        /**
         * Execute FLIP animation if any elements need to move.
         * This implements the Invert and Play phases of FLIP.
         */
        if (animations.length > 0) {
            setIsAnimating(true)

            // INVERT: Apply initial transforms to move elements back to previous positions
            animations.forEach(({ element, deltaY }) => {
                const htmlElement = element as HTMLElement
                htmlElement.style.transform = `translateY(${deltaY}px)`
                htmlElement.style.transition = 'none'
            })

            // Force a reflow to ensure transforms are applied before animation
            container.offsetHeight

            // PLAY: Animate transforms back to 0, moving elements to final positions
            animations.forEach(({ element }) => {
                const htmlElement = element as HTMLElement
                htmlElement.style.transform = 'translateY(0px)'
                htmlElement.style.transition = 'transform 0.3s ease-in-out'
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

            // Set cleanup timer (double the animation duration for safety)
            const timer = setTimeout(cleanup, 600)
            return () => clearTimeout(timer)
        }
    }, dependencies)

    return { containerRef, isAnimating }
}