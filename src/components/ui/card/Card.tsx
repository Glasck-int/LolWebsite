'use client'

import { Tooltip, ToolTipBody, ToolTipMessage } from '@/components/ui/Tooltip'
import React, { useRef, useState, useEffect, ReactNode, useLayoutEffect } from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
}

interface CardTabProps {
    children: ReactNode
    onClick: () => void
    isActive: boolean
}

interface CardHeaderProps extends CardSectionProps {
    activeIndex?: number
    setActiveIndex?: (index: number) => void
    index?: number
}

function getHeaderTw(bg = true) {
    let str = 'w-full flex items-center px-[14px] h-full '
    return bg ? str + 'bg-white-04 ' : str
}

export const Card = ({ children, className }: CardProps) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const headerProps = React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)){
            console.log(child.type.toString)
            if (child.type === CardBody)
                return child
            else{
                console.log(child)
                return React.cloneElement(
                    child as React.ReactElement<CardHeaderProps>,
                    {
                        activeIndex : activeIndex,
                        setActiveIndex : setActiveIndex,
                    }
                )
            }
        }
        return child
    })

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
                'justify-between min-h-[35px] md:min-h-[40px]' +
                ' ' +
                getHeaderTw() +
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
                'justify-start content-center min-h-[35px] md:min-h-[40px]' +
                ' ' +
                getHeaderTw() +
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

export const CardDoubleHeaderTop = ({
    children,
    className,
}: CardSectionProps) => {
    return (
        <div
            className={
                'w-full flex items-stretch justify-evenly content-center min-h-[42px] md:min-h-[45px]' +
                ' ' +
                className
            }
        >
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return (
                        <CardDOubleHeaderTopDiv>{child}</CardDOubleHeaderTopDiv>
                    )
                }
                return <div>ERROR IN CardDoubleHeaderTop</div>
            })}
        </div>
    )
}

const CardDOubleHeaderTopDiv = ({
    children,
    isActive,
    onClick,
}: CardTabProps) => {
    return (
        <div
            className={`flex grow-1 justify-center items-center default-top-border-radius ${
                isActive ? 'bg-white-04' : ''
            }`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export const CardDoubleHeaderBot = ({
    children,
    className,
}: CardSectionProps) => {
    return <CardOneHeader className={className}>{children}</CardOneHeader>
}

export const CardHeader = ({ children, className, activeIndex, setActiveIndex }: CardHeaderProps) => {

    useLayoutEffect(() => {
        console.log(activeIndex)
    }, [activeIndex])

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
