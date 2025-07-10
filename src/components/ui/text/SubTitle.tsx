import React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/utils/Tooltip'

interface SubTitleProps {
    children?: React.ReactNode
    className?: string
    tooltip?: string
}

/**
 * SubTitle component for displaying subtitle content with optional tooltip
 *
 * A flexible subtitle component that can display any content (text, images, etc.)
 * with optional tooltip functionality and customizable styling.
 *
 * @param children - The content to display (text, images, or any React node)
 * @param className - Additional CSS classes to apply to the subtitle
 * @param tooltip - Optional tooltip text to display on hover
 * @returns A subtitle element with optional tooltip wrapper
 *
 * @example
 * ```tsx
 * // Text only
 * <SubTitle>My Subtitle</SubTitle>
 *
 * // With tooltip
 * <SubTitle tooltip="Additional information">My Subtitle</SubTitle>
 *
 * // With image
 * <SubTitle>
 *   <img src="/icon.png" alt="Icon" />
 *   My Subtitle
 * </SubTitle>
 * ```
 *
 * @remarks
 * The component uses a paragraph element by default with predefined styling.
 * Tooltip is only rendered if the tooltip prop is provided.
 */
export const SubTitle = ({ children, className, tooltip }: SubTitleProps) => {
    const content = (
        <p
            className={cn(
                'text-clear-grey font-semibold text-sm md:text-base',
                className
            )}
        >
            {children}
        </p>
    )

    if (tooltip) {
        return (
            <Tooltip content={tooltip} maxWidth={200}>
                {content}
            </Tooltip>
        )
    }

    return content
}
