'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
    content: React.ReactNode
    children?: React.ReactNode
    maxWidth?: number
}

export const Tooltip = ({
    content,
    children,
    maxWidth = 300,
}: TooltipProps) => {
    const [visible, setVisible] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const [mouseX, setMouseX] = useState(0)
    const [tooltipWidth, setTooltipWidth] = useState(0)
    const [tooltipHeight, setTooltipHeight] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = (e: React.MouseEvent) => {
        setMouseX(e.clientX)
    }

    const handleMouseEnter = () => {
        setVisible(true)
        setTimeout(() => setShowTooltip(true), 10)
    }

    const handleMouseLeave = () => {
        setShowTooltip(false)
        setTimeout(() => setVisible(false), 150)
    }

    useEffect(() => {
        if (tooltipRef.current) {
            setTooltipWidth(tooltipRef.current.offsetWidth)
            setTooltipHeight(tooltipRef.current.offsetHeight)
        }
    }, [visible, content])

    const getTooltipPosition = () => {
        if (!containerRef.current) return { left: 0, top: 0 }

        const containerRect = containerRef.current.getBoundingClientRect()
        const screenWidth = window.innerWidth

        // Position Y fixe au-dessus du composant, ajustée selon la hauteur du tooltip
        const top = containerRect.top - tooltipHeight - 10

        // Position X qui suit la souris mais reste dans les limites
        let left = mouseX - tooltipWidth / 2

        // Empêcher de sortir du côté gauche
        if (left < 10) {
            left = 10
        }

        // Empêcher de sortir du côté droit
        if (left + tooltipWidth > screenWidth - 10) {
            left = screenWidth - tooltipWidth - 10
        }

        return { left, top }
    }

    const position = getTooltipPosition()

    return (
        <div
            ref={containerRef}
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {children ? children : <Info />}
            {visible && (
                <div
                    ref={tooltipRef}
                    className={`fixed bg-dark-grey border border-clear-grey text-white text-xs px-2 py-1 z-[100] shadow-lg pointer-events-none default-border-radius transition-all duration-50 ease-out ${
                        showTooltip
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-95'
                    }`}
                    style={{
                        left: position.left,
                        top: position.top,
                        maxWidth: `${maxWidth}px`,
                        whiteSpace: 'normal',
                        wordWrap: 'break-word',
                    }}
                >
                    {content}
                </div>
            )}
        </div>
    )
}
