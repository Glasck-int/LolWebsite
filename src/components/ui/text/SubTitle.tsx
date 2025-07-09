import React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/utils/Tooltip'

interface SubTitleProps {
    text: string
    className?: string
    tooltip?: string
}

export const SubTitle = ({ text, className, tooltip }: SubTitleProps) => {
    return (
        <Tooltip content={tooltip} maxWidth={200}>
        <p
            className={cn(
                'text-clear-grey font-semibold text-sm md:text-base',
                className
            )}
        >
                {text}
            </p>
        </Tooltip>
    )
}
