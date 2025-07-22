'use client'

import React, { useState, useContext } from 'react'
import { CardProps, useCard } from '../ui/card/Card'
import { createContext } from 'react'

const SwitchContextP = createContext<{
    activeIndex: number
    setActiveIndex: (index: number) => void
} | null>(null)

interface SwitchProps {
    children: React.ReactNode[]
    isRight: number
}

interface ChildrenProps{
    children: React.ReactNode
    className?:string
}

export const useSwitch = () => {
    const context = useContext(SwitchContextP)
    if (!context) {
        throw new Error('useSwitch doit être utilisé dans un composant Switch')
    }
    return context
}

export const SwitchContext = ({ children }: CardProps) => {
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <SwitchContextP.Provider value={{ activeIndex, setActiveIndex }}>
            <div className="w-full h-full">{children}</div>
        </SwitchContextP.Provider>
    )
}

export const Switch = ({ children, className = '' }: CardProps) => {
    const { activeIndex } = useSwitch()

    if (React.Children.count(children) !== 2)
        return (
            <p className="text-red">
                ERROR, more than 2 switch body content detected
            </p>
        )
    const childrenArray = React.Children.toArray(children)

    return (
        <div className={`${className}`}>
            <SwitchButton isRight={activeIndex}>{childrenArray}</SwitchButton>
        </div>
    )
}

const SwitchButton = ({ children, isRight }: SwitchProps) => {
    const { setActiveIndex } = useSwitch()

    return (
        <div
            onClick={() => setActiveIndex(isRight === 0 ? 1 : 0)}
            className={`relative w-[96px] h-[32px] rounded-4xl bg-black/8 flex items-center px-[4.3px] py-[4.3px] select-none cursor-pointer
                transition-shadow duration-300 ease-in-out
                ${
                    isRight === 1
                        ? 'shadow-[inset_4px_4px_3.46px_rgba(0,0,0,0.35)]'
                        : 'shadow-[inset_-4px_4px_3.46px_rgba(0,0,0,0.35)]'
                }`}
        >
            {/* Boule animée */}
            <div
                className="absolute rounded-full bg-white h-[24px] w-[24px] top-[4.3px] left-[4.3px]"
                style={{
                    transform:
                        isRight === 1 ? 'translateX(63px)' : 'translateX(0px)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    willChange: 'transform',
                }}
            />

            {!isRight ? (
                <div
                    className={`flex items-center justify-start
                transition-opacity duration-200 ease-in-out gap-2`}
                >
                    <div className="h-[24px] w-[24px]" />
                    <div className="font-semibold text-sm text-clear-grey">
                        {children[isRight]}
                    </div>
                </div>
            ) : (
                <div
                    className={`flex items-center justify-end
                transition-opacity duration-200 ease-in-out gap-2 w-full`}
                >
                    <div className="font-semibold text-sm text-clear-grey">
                        {children[isRight]}
                    </div>
                    <div className="h-[24px] w-[24px]" />
                </div>
            )}
        </div>
    )
}

export const SwitchContent = ({ children, className = '' }: CardProps) => {
    return <div className={` ${className}`}>{children}</div>
}


export const SwitchBodyMultiple = ({ children }: ChildrenProps) => {
    const { activeIndex } = useSwitch()
    return (
        <div className="h-full w-full">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    if (index == activeIndex) {
                        return (
                            <SwitchBodyMultipleDiv>{child}</SwitchBodyMultipleDiv>
                        )
                    } else {
                        return null
                    }
                }
                return <div>ERROR IN SwitchBodyMultiple</div>
            })}
        </div>
    )
}

/**
 * Internal wrapper for active content in `SwitchBodyMultiple`.
 *
 * Used internally to render the selected child based on `activeIndex`.
 *
 * @param children - The active content
 * @returns A full-width, full-height container
 */
const SwitchBodyMultipleDiv = ({ children }: ChildrenProps) => {
    return <div className="h-full w-full">{children}</div>
}

export const SwitchBodyMultipleContent = ({
    children,
    className = '',
}: CardProps) => {
    return <div className={'w-full h-full' + ' ' + className}>{children}</div>
}