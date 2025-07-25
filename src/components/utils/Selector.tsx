'use client'

import React from 'react'
import { ChildAndClassname } from '../ui/card/Card'

interface SelectorProps extends ActiveIndexProps {
    setActiveIndex: (index: number) => void
}

interface ActiveIndexProps extends ChildAndClassname {
    activeIndex: number
}

/**
 * SelectorIcon – Interactive component for rendering clickable icons or items.
 *
 * This component maps over its children and displays them as selectable items.
 * Clicking on an item updates the active index using the provided `setActiveIndex` function.
 *
 * @function SelectorIcon
 *
 * @param ReactNode children - The items to display as selectable icons.
 * @param string [className] - Optional additional classes.
 * @param number activeIndex - Currently active index.
 * @param Function setActiveIndex - Callback to update the active index.
 *
 * @returns A row of selectable elements.
 *
 * @example
 * <SelectorIcon activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
 *   <Icon1 />
 *   <Icon2 />
 * </SelectorIcon>
 */
export const SelectorIcon = ({
    children,
    className,
    activeIndex,
    setActiveIndex,
}: SelectorProps) => {
    return (
        <div className="flex ">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return (
                        <div
                            className={` cursor-pointer select-none ${
                                activeIndex === index
                                    ? 'text-white'
                                    : 'text-grey hover:text-clear-grey'
                            }`}
                            onClick={() => setActiveIndex(index)}
                        >
                            {child}
                        </div>
                    )
                }
                return <div>ERROR IN CardHeaderTab</div>
            })}
        </div>
    )
}

/**
 * SelectorContent – Container for individual content sections.
 *
 * This component is used as a wrapper for each section of content
 * inside the `SelectorBody && SelectorIcon` as needed.
 *
 * @function SelectorContent
 *
 * @param ReactNode children - The content to render.
 * @param string [className] - Optional additional classes.
 *
 * @returns A styled content container.
 *
 * @example
 * <SelectorContent>
 *   <p>Some tab content</p>
 * </SelectorContent>
 */
export const SelectorContent = ({ children, className }: ChildAndClassname) => {
    return <div className={'w-full h-full' + ' ' + className}>{children}</div>
}

/**
 * SelectorBody – Displays the active child based on the active index.
 *
 * This component conditionally renders only the child at the current `activeIndex`.
 *
 * @function SelectorBody
 *
 * @param ReactNode children - All content sections to choose from.
 * @param string [className] - Optional additional classes.
 * @param number activeIndex - Index of the content to display.
 *
 * @returns JSX.Element The currently selected content.
 *
 * @example
 * <SelectorBody activeIndex={activeIndex}>
 *   <SelectorContent>Tab 1</SelectorContent>
 *   <SelectorContent>Tab 2</SelectorContent>
 * </SelectorBody>
 */
export const SelectorBody = ({
    children,
    className,
    activeIndex,
}: ActiveIndexProps) => {
    return (
        <div className="h-full w-full">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    if (index == activeIndex) {
                        return (
                            <SelectorBodyMultipleDiv>{child}</SelectorBodyMultipleDiv>
                        )
                    } else {
                        return null
                    }
                }
                return <div>ERROR IN SelectorBodyMultiple</div>
            })}
        </div>
    )
}

/**
 * Internal wrapper for active content in `SelectorBodyMultiple`.
 *
 * Used internally to render the selected child based on `activeIndex`.
 *
 * @param children - The active content
 * @returns A full-width, full-height container
 */
const SelectorBodyMultipleDiv = ({ children }: ChildAndClassname) => {
    return <div className="h-full w-full">{children}</div>
}
