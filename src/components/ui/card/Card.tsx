'use client'

import { Tooltip, ToolTipBody, ToolTipMessage } from '@/components/ui/Tooltip'
import React, { useRef, useState, useEffect } from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
}

export const Card = ({ children, className }: CardProps) => {
    return (
        <div
            className={
                'bg-white-06 default-border-radius h-full w-full flex flex-col justify-evenly backdrop-blur ' +
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

    useEffect(() => {
        setSelf(selfRef.current)
    }, [selfRef])

    return (
        <div
            ref={selfRef}
            className={
                'w-full flex justify-between items-center px-[14px] bg-white-04 h-full min-h-[35px] md:min-h-[40px]' +
                ' ' +
                className
            }
        >
            {children}
            <Tooltip>
                <ToolTipMessage align="end" containerRef={self}>
                    <p>{info}</p>
                </ToolTipMessage>
                <ToolTipBody />
            </Tooltip>
        </div>
    )
}

export const CardOneHeader = ({ children, className }: CardSectionProps) => {
    return (
        <div
            className={
                'w-full flex justify-start content-center items-center px-[14px] bg-white-04 h-full min-h-[35px] md:min-h-[40px]' +
                ' ' +
                className
            }
        >
            {children}
        </div>
    )
}

export const CardDoubleHeader = ({ children, className }: CardSectionProps) => {
    return (
        <div className={'flex flex-col w-full' + ' ' + className}>
            {children}
        </div>
    )
}

export const CardDoubleHeaderTop = () => {
    return (
        <div>

        </div>
    )
}

export const CardDoubleHeaderBot = ({children, className}: CardSectionProps) => {
    return (
        <CardOneHeader className={className}>
            {children}
        </CardOneHeader>
    )
}

export const CardHeader = ({ children, className }: CardSectionProps) => {
    return (
        <div
            className={`w-full default-top-border-radius text-sm color-grey  flex items-center ${
                className ?? ''
            }`}
        >
            {children}
        </div>
    )
}

export const CardBody = ({ children, className }: CardSectionProps) => {
    return (
        <div className={`flex grow-1 px-[15px] ${className ?? ''}`}>
            {children}
        </div>
    )
}
