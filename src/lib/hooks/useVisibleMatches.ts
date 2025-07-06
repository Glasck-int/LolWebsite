'use client'

import React from 'react'

/**
 * Hook to determine how many matches can fit in the container
 */
export const useVisibleMatches = (
    totalMatches: number,
    showSingleMatchOnDesktop: boolean
) => {
    const [visibleCount, setVisibleCount] = React.useState(1)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const testRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const updateVisibleCount = () => {
            if (!containerRef.current || !testRef.current) return

            const containerWidth = containerRef.current.offsetWidth
            const testWidth = testRef.current.offsetWidth

            // Calculate how many matches can fit
            const maxMatches = Math.floor(containerWidth / testWidth)

            let newCount = 1
            if (showSingleMatchOnDesktop) {
                newCount = 1
            } else if (maxMatches >= 3) {
                newCount = Math.min(totalMatches, 3)
            } else if (maxMatches >= 2) {
                newCount = Math.min(totalMatches, 2)
            } else {
                newCount = 1
            }

            setVisibleCount(newCount)
        }

        updateVisibleCount()
        window.addEventListener('resize', updateVisibleCount)

        const resizeObserver = new ResizeObserver(updateVisibleCount)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => {
            window.removeEventListener('resize', updateVisibleCount)
            resizeObserver.disconnect()
        }
    }, [totalMatches, showSingleMatchOnDesktop])

    return { containerRef, testRef, visibleCount }
}
