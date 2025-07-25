'use client'

import React, { useState, useContext } from 'react'
import { createContext } from 'react'

// Interfaces

export interface ChildAndClassname {
    children: React.ReactNode
    className?: string
}

// Context

const CardContextP = createContext<{
    activeIndex: number
    setActiveIndex: (index: number) => void
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
 * @throws {Error} Throws if the hook is used outside of a <Card> component.
 *
 * @returns {Object} The context object containing:
 * @returns {number} return.activeIndex - The currently active index.
 * @returns {Function} return.setActiveIndex - Function to update the active index.
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

export const Card = ({ children, className = '' }: ChildAndClassname) => {
    return (
        <div
            className={
                'bg-white-06 default-border-radius h-full w-full flex flex-col justify-evenly backdrop-blur overflow-hidden ' +
                className
            }
        >
            {children}
        </div>
    )
}

export const CardContext = ({
    children,
    className = '',
}: ChildAndClassname) => {
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <CardContextP.Provider value={{ activeIndex, setActiveIndex }}>
            <div
                className={
                    'bg-white-06 default-border-radius h-full w-full flex flex-col justify-evenly backdrop-blur overflow-hidden ' +
                    className
                }
            >
                {children}
            </div>
        </CardContextP.Provider>
    )
}
