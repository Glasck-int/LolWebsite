'use client'

import { Tooltip, ToolTipBody, ToolTipMessage } from '@/app/components/ui/Tooltip'
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
}

export const Card = ({ children, className }: CardProps) => {
    return (
        <div
            className={
                'bg-white-06 default-border-radius h-full w-full flex flex-col justify-between ' +
                className
            }
        >
            {children}
        </div>
    )
}

interface CardSectionProps {
    children: React.ReactNode
    className?: string
}

interface CardToolTip {
    children: React.ReactNode
    info: string
    className?: string
}

export const CardToolTip = ({ children, className, info }: CardToolTip) => {
    const [self, setSelf] = useState<HTMLElement | null>(null)
    const selfRef = useRef<HTMLDivElement>(null)

    useEffect(() =>{
        setSelf(selfRef.current)
    }, [selfRef])

    return (
        <div ref={selfRef} className={'w-full flex justify-between ' + className}>
            {children}
            <Tooltip>
                <ToolTipMessage align='end' containerRef={self}>
                    <p>{info}</p>
                </ToolTipMessage>
                <ToolTipBody/>
            </Tooltip>
        </div>
    )
}

export const CardHeader = ({ children, className }: CardSectionProps) => {
    return (
        <div
            className={`bg-white-04 px-[15px] flex items-center min-h-[35px] default-top-border-radius ${
                className ?? ''
            }`}
        >
            {children}
        </div>
    )
}

export const CardBody = ({ children, className }: CardSectionProps) => {
    return (
        <div className={`h-full px-[15px] ${className ?? ''}`}>{children}</div>
    )
}
