'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleMouseMove = (e: React.MouseEvent) => {
        setMouseX(e.clientX)
    }

    const handleMouseEnter = () => {
        if (content) {
            setVisible(true)
            setTimeout(() => setShowTooltip(true), 10)
        }
    }

    const handleMouseLeave = () => {
        setShowTooltip(false)
        setTimeout(() => setVisible(false), 150)
    }

    useEffect(() => {
        if (tooltipRef.current && visible) {
            const rect = tooltipRef.current.getBoundingClientRect()
            setTooltipWidth(rect.width)
            setTooltipHeight(rect.height)
        }
    }, [visible, content])

    const getTooltipPosition = () => {
        if (!containerRef.current) return { left: 0, top: 0 }

        const containerRect = containerRef.current.getBoundingClientRect()
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        const margin = 15 // Increased margin for better safety

        // Calculate preferred position above the element
        let top = containerRect.top - tooltipHeight - 10
        let left = mouseX - tooltipWidth / 2

        // If tooltip would go above viewport, position below instead
        if (top < margin) {
            top = containerRect.bottom + 10
        }

        // If tooltip would go below viewport, position above with adjustment
        if (top + tooltipHeight > screenHeight - margin) {
            top = containerRect.top - tooltipHeight - 10
        }

        // Keep tooltip within horizontal bounds with better calculation
        if (left < margin) {
            left = margin
        }

        if (left + tooltipWidth > screenWidth - margin) {
            left = screenWidth - tooltipWidth - margin
        }

        // Double check to ensure tooltip never exceeds screen bounds
        left = Math.max(
            margin,
            Math.min(left, screenWidth - tooltipWidth - margin)
        )
        top = Math.max(
            margin,
            Math.min(top, screenHeight - tooltipHeight - margin)
        )

        return { left, top }
    }

    const position = getTooltipPosition()

    const tooltipElement =
        visible && content ? (
            <div
                ref={tooltipRef}
                className={`fixed bg-dark-grey border border-clear-grey text-white text-xs px-2 py-1 z-[9999] shadow-lg pointer-events-none default-border-radius transition-all duration-100 ease-out ${
                    showTooltip ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
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
        ) : null

    return (
        <div
            ref={containerRef}
            className="relative cursor-default"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {children ? children : <Info color='#bab9b9'/>}
            {mounted &&
                tooltipElement &&
                createPortal(tooltipElement, document.body)}
        </div>
    )
}
