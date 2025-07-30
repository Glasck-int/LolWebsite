import React, { useState } from 'react'
import { useSpoiler } from '@/contexts/SpoilerContext'

interface SpoilerWrapperProps {
    /** The content to conditionally hide/show */
    children: React.ReactNode
}

/**
 * Wrapper component for managing conditional display of spoiler-sensitive content
 * 
 * This component allows hiding content (scores, results, etc.) based on user's spoiler
 * preferences, while providing the ability to individually reveal each hidden element.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage to hide a score
 * <SpoilerWrapper>
 *   <div>Score: 3-1</div>
 * </SpoilerWrapper>
 * 
 * // Usage to hide any content
 * <SpoilerWrapper>
 *   <TeamResult winner="Team A" loser="Team B" />
 * </SpoilerWrapper>
 * ```
 * 
 * @param props - Component properties
 * @param props.children - Content to show/hide based on spoiler state
 * 
 * @returns JSX element that displays either the content or a clickable placeholder
 * 
 * @remarks
 * The component follows this display logic:
 * 1. If spoilers are globally enabled (via Eye toggle) → shows content
 * 2. If individual spoiler has been revealed by clicking → shows content  
 * 3. Otherwise → shows a clickable "[Spoiler]" placeholder to reveal content
 * 
 * Global spoiler state is managed by SpoilerContext and persists via localStorage.
 * Local individual reveal state is managed by the component's useState.
 * 
 * @see {@link SpoilerContext} For global spoiler management
 * @see {@link useSpoiler} Hook to access spoiler context
 * 
 * @since 1.0.0
 */
const SpoilerWrapper = ({ children }: SpoilerWrapperProps) => {
    const { isSpoilerVisible } = useSpoiler()
    const [isLocallyVisible, setIsLocallyVisible] = useState(false)

    // if the spoiler is visible, show the content
    if (isSpoilerVisible || isLocallyVisible) {
        return <>{children}</>
    }

    // if the spoiler is not visible, show the placeholder
    return (
        <div 
            className="flex flex-col items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => setIsLocallyVisible(true)}
        >
            <span className="text-gray-400 text-sm italic">
                [Spoiler]
            </span>
        </div>
    )
}   

export default SpoilerWrapper