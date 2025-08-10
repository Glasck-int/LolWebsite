'use client'

import React, { useState, useContext } from 'react'
import { createContext } from 'react'

// Interfaces

export interface ChildAndClassname {
    children: React.ReactNode
    className?: string
}

// Context

export const CardContextP = createContext<{
    activeIndex: number
    setActiveIndex: (index: number) => void
    isHide:boolean
    setIsHide: (value:boolean) => void
} | null>(null)

// Fonctions

/**
 * Custom React hook to access the CardContext state.
 *
 * Allows components nested within a <Card> to access and modify the current active index.
 * Throws an error if used outside of a Card context provider, enforcing proper usage hierarchy.
 *
 * @function useCard
 *
 * @throws Error Throws if the hook is used outside of a <Card> component.
 *
 * @returns Object The context object containing:
 * @returns number return.activeIndex - The currently active index.
 * @returns Function return.setActiveIndex - Function to update the active index.
 *
 * @example
 * const { activeIndex, setActiveIndex } = useCard()
 */
export const useCard = () => {
    const context = useContext(CardContextP)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

// Components

/**
 * Card component
 *
 * Renders a styled container with default border-radius, blur, and layout styling.
 *
 * @param children - React children to be displayed inside the card
 * @param className - Optional Tailwind CSS classes for additional styling
 * @returns A flex column wrapper for layout or content blocks
 *
 * @example
 * ```tsx
 * <Card className="p-4">
 *   <CardHeader>
 *     <p>Header</p>
 *   </CardHeader>
 *   <CardBody>
 *     <p>Body</p>
 *   </CardBody>
 *   <p>Content here</p>
 * </Card>
 * ```
 *
 * @remarks
 * Useful as a base container with consistent design language across the app
 */
export const Card = ({ children, className = '' }: ChildAndClassname) => {
    return (
        <section
            className={
                'bg-white-06 default-border-radius h-full w-full flex flex-col justify-evenly backdrop-blur overflow-hidden ' +
                className
            }
        >
            {children}
        </section>
    )
}

/**
 * CardContext component
 *
 * Provides shared state (active index & visibility) to all nested components via context.
 *
 * @param children - React children that can access the context state
 * @param className - Optional Tailwind classes for styling the card layout
 * @returns A Card-wrapped layout that includes a React context provider
 *
 * @example
 * ```tsx
 * <CardContext>
 *   <CardHeader>
 *     <p>Header</p>
 *   </CardHeader>
 *   <CardBody>
 *     <p>Body</p>
 *   </CardBody>
 * </CardContext>
 * ```
 *
 * @remarks
 * Supplies `activeIndex`, `setActiveIndex`, `isHide`, and `setIsHide` via CardContextP.Provider
 * allowing deeply nested components to share UI state
 */
export const CardContext = ({
    children,
    className = '',
}: ChildAndClassname) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isHide, setIsHide] = useState(false)

    return (
        <CardContextP.Provider value={{ activeIndex, setActiveIndex, isHide, setIsHide }}>
            <div
                className={`h-full w-full ${className}`}

            >
                {children}
            </div>
        </CardContextP.Provider>
    )
}
