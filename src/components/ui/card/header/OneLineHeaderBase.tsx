'use client'

import React from 'react'
import { Tooltip } from '../../Tooltip'

interface OneLineHeaderBaseProps {
    className: string
    title?: string
    Body?: React.ComponentType
    help?: string
}

export const OneLineHeaderBase = ({
    className,
    title,
    Body,
    help,
}: OneLineHeaderBaseProps) => {
    return (
        <div className={'h-[35px] w-full flex justify-between ' + className}>
            {title ? <p>{title}</p> : Body && <Body />}
			<Tooltip content="help me"/>
        </div>
    )
}
