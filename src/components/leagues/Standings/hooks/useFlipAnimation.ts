'use client'
import { useLayoutEffect, useRef, useState } from 'react'

export const useFlipAnimation = (dependencies: any[]) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const prevPositions = useRef<Map<string, { top: number; height: number }>>(new Map())

    useLayoutEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const items = container.querySelectorAll('[data-team-key]')
        
        // If this is the first render, just store positions
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

        // Calculate differences and animate
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
                
                if (Math.abs(deltaY) > 1) { // Only animate if there's significant movement
                    animations.push({ element: item, deltaY })
                }
            }

            // Update stored position
            prevPositions.current.set(teamKey, {
                top: currentTop,
                height: currentRect.height
            })
        })

        if (animations.length > 0) {
            setIsAnimating(true)

            // Apply initial transforms (INVERT)
            animations.forEach(({ element, deltaY }) => {
                const htmlElement = element as HTMLElement
                htmlElement.style.transform = `translateY(${deltaY}px)`
                htmlElement.style.transition = 'none'
            })

            // Force reflow
            container.offsetHeight

            // Animate to final positions (PLAY)
            animations.forEach(({ element }) => {
                const htmlElement = element as HTMLElement
                htmlElement.style.transform = 'translateY(0px)'
                htmlElement.style.transition = 'transform 0.3s ease-in-out'
            })

            // Clean up after animation
            const cleanup = () => {
                animations.forEach(({ element }) => {
                    const htmlElement = element as HTMLElement
                    htmlElement.style.transition = ''
                    htmlElement.style.transform = ''
                })
                setIsAnimating(false)
            }

            const timer = setTimeout(cleanup, 600)
            return () => clearTimeout(timer)
        }
    }, dependencies)

    return { containerRef, isAnimating }
}