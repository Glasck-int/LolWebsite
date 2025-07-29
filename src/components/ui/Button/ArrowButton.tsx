import React from 'react'
import { ChildAndClassname } from '../card/Card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props extends ChildAndClassname {
    onLeftClick: () => void
    onRightClick: () => void
    leftDisabled?: boolean
    rightDisabled?: boolean
}

/**
 * ArrowButton component
 *
 * Renders left and right arrow buttons with optional child content in between. 
 * Allows navigation actions through the provided click handlers.
 *
 * @param className - Optional custom class names for styling the container
 * @param onLeftClick - Function triggered when the left arrow button is clicked
 * @param onRightClick - Function triggered when the right arrow button is clicked
 * @param leftDisabled - If true, disables the left arrow button and grays it out (default: false)
 * @param rightDisabled - If true, disables the right arrow button and grays it out (default: false)
 * @param children - Optional content rendered between the arrow buttons
 * @returns A JSX element containing two arrow buttons and any children in between
 *
 * @example
 * 
 * ts
 * <ArrowButton 
 *    onLeftClick={() => console.log("Left")} 
 *    onRightClick={() => console.log("Right")}
 * >
 *    <span>Page 1</span>
 * </ArrowButton>
 *
 * @remarks
 * Icons are from `lucide-react`. The button colors and hover states are styled via Tailwind CSS.
 * Disabled buttons do not respond to clicks and have different text color styling.
 *
 * @see https://lucide.dev/icons/chevron-left and https://lucide.dev/icons/chevron-right
 */
export default function ArrowButton({
    className = '',
    onLeftClick,
    onRightClick,
    leftDisabled = false,
    rightDisabled = false,
    children,
}: Props) {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <button
                className={` ${
                    !leftDisabled
                        ? 'text-clear-grey hover:text-white cursor-pointer'
                        : 'text-grey'
                }`}
                onClick={onLeftClick}
            >
                <ChevronLeft />
            </button>
            {children}
            <button
                className={` ${
                    !rightDisabled
                        ? 'text-clear-grey hover:text-white cursor-pointer'
                        : 'text-grey'
                }`}
                onClick={onRightClick}
            >
                <ChevronRight />
            </button>
        </div>
    )
}
