'survivaluse client'

import React, { useState, useContext } from 'react'
import { ChildAndClassname, useCard } from '../ui/card/Card'

interface SwitchProps extends ChildAndClassname {
    activeIndex: number
    setActiveIndex: (index: number) => void
}

interface SwitchButtonProps {
    setActiveIndex: (index: number) => void
    children: React.ReactNode[]
    isRight: number
}

interface SwitchBodyProps extends ChildrenProps{
    activeIndex: number
}

interface ChildrenProps {
    children: React.ReactNode
    className?: string
}

/**
 * Switch – A toggle component that switches between two views.
 *
 * This component displays a switch button with two possible states.
 * It ensures exactly two children are passed and toggles the active index on click.
 *
 * @function Switch
 *
 * @param React.ReactNode children - Two children representing the switch options.
 * @param string [className] - Optional class for custom styling.
 * @param number activeIndex - Current selected index (0 or 1).
 * @param (index: number) => void setActiveIndex - Function to update the active index.
 *
 * @returns Rendered switch component or error if more than two children.
 *
 * @example
 * <Switch activeIndex={0} setActiveIndex={setIndex}>
 *   <SwitchContent>Left</SwitchContent>
 *   <SwitchContent>Right</SwitchContent>
 * </Switch>
 */
export const Switch = ({
    children,
    className = '',
    activeIndex,
    setActiveIndex,
}: SwitchProps) => {
    if (React.Children.count(children) !== 2)
        return (
            <p className="text-red">
                ERROR, more than 2 switch body content detected
            </p>
        )
    const childrenArray = React.Children.toArray(children)

    return (
        <div className={`${className}`}>
            <SwitchButton
                isRight={activeIndex}
                setActiveIndex={() => setActiveIndex(activeIndex === 1 ? 0 : 1)}
            >
                {childrenArray}
            </SwitchButton>
        </div>
    )
}

/**
 * SwitchButton – Internal UI button for the switch.
 *
 * This handles rendering the toggle animation and content display depending on the current active side.
 * It shows the selected child content based on the active index.
 *
 * @function SwitchButton
 *
 * @param number isRight - Whether the right side is active (1 or 0).
 * @param (index: number) => void setActiveIndex - Toggles the active index when clicked.
 * @param React.ReactNode[] children - Two children nodes displayed on either side of the switch.
 *
 * @returns  The rendered animated toggle button.
 */
const SwitchButton = ({
    children,
    isRight,
    setActiveIndex,
}: SwitchButtonProps) => {
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

/**
 * SwitchContent – Simple wrapper for switch option content.
 *
 * Used to wrap each selectable element inside the <Switch> component.
 *
 * @function SwitchContent
 *
 * @param React.ReactNode children - Content inside the switch option.
 * @param string [className] - Optional custom styling.
 *
 * @returns  The wrapped content.
 */
export const SwitchContent = ({
    children,
    className = '',
}: ChildAndClassname) => {
    return <div className={` ${className}`}>{children}</div>
}

/**
 * SwitchBodyMultiple – Displays the body content associated with the active switch index.
 *
 * Renders the child element that matches the current active index, hiding others.
 *
 * @function SwitchBodyMultiple
 *
 * @param React.ReactNode children - Multiple content elements.
 * @param number activeIndex - The index of the currently active child to show.
 *
 * @returns The currently active content, or an error if children are invalid.
 *
 * @example
 * <SwitchBodyMultiple activeIndex={1}>
 *   <SwitchBodyMultipleContent>View A</SwitchBodyMultipleContent>
 *   <SwitchBodyMultipleContent>View B</SwitchBodyMultipleContent>
 * </SwitchBodyMultiple>
 */
export const SwitchBodyMultiple = ({ children, activeIndex }: SwitchBodyProps) => {
    return (
        <div className="h-full w-full">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    if (index == activeIndex) {
                        return (
                            <SwitchBodyMultipleDiv>
                                {child}
                            </SwitchBodyMultipleDiv>
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
}: ChildAndClassname) => {
    return <div className={'w-full h-full' + ' ' + className}>{children}</div>
}
