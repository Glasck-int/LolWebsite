'use client'

import React, {
    useState,
    useContext,
} from 'react'
import { createContext } from 'react'

// Interfaces

export interface CardProps {
    children: React.ReactNode
    className?: string
}

// Context

const CardContext = createContext<{
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
    const context = useContext(CardContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

// Components

/**
 * Card component that provides a UI container with shared state.
 *
 * Wraps its children inside a stylized container and exposes a context
 * (activeIndex and setActiveIndex) for nested components to use.
 * Commonly used as a layout element where internal state or tabs are needed.
 *
 * @function Card
 *
 * @param {CardProps} props - Props object.
 * @param {React.ReactNode} props.children - React children to render inside the card.
 * @param {string} [props.className] - Optional. Additional Tailwind classes for styling.
 *
 * @returns {JSX.Element} A styled div wrapped in a CardContext.Provider.
 *
 * @example
 * <Card className="p-4">
 *   <TabComponent />
 * </Card>
 */
export const Card = ({ children, className = '' }: CardProps) => {
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <CardContext.Provider value={{ activeIndex, setActiveIndex }}>
            <div
                className={
                    'bg-white-06 default-border-radius h-full w-full flex flex-col justify-evenly backdrop-blur overflow-hidden ' +
                    className
                }
            >
                {children}
            </div>
        </CardContext.Provider>
    )
}

