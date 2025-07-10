'use client'

import React, { useContext, createContext, useState, ReactNode } from 'react'
import { CardProps } from './Card'

interface CardSortProps {
    children: ReactNode
    className?: string
    sortName: number | string
}

const SortContext = createContext<{
    activeSort: string | number | undefined
    setActiveSort: (sort: number | string | undefined) => void
} | null>(null)

/**
 * Custom hook to access the current sort context.
 *
 * Returns the current `activeSort` value and the `setActiveSort` function
 * from the `SortContext`. Must be used within a `CardSort` component.
 *
 * @returns An object containing `activeSort` and `setActiveSort`.
 *
 * @throws Error - Throws an error if used outside of a `CardSort` provider.
 *
 * @example
 * ```ts
 * const { activeSort, setActiveSort } = useSort();
 * setActiveSort('alpha');
 * ```
 *
 * @remarks
 * This hook simplifies access to the sort state inside deeply nested components.
 * Ensure your component is wrapped in a `<CardSort>` or it will throw.
 *
 * @see CardSort
 */
export const useSort = () => {
    const context = useContext(SortContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

/**
 * Provider component for managing sort state context.
 *
 * Wraps its children in a context that exposes `activeSort` and `setActiveSort`
 * for components to use via the `useSort` hook.
 *
 * @param children - React child components that will have access to sort context
 * @param className - Optional class name for styling the wrapping div
 * @returns A context provider element with sorting capabilities
 *
 * @example
 * ```tsx
 * <CardSort>
 *   <CardHeaderSortContent sortName="alpha">Alpha</CardHeaderSortContent>
 *   <SortedList />
 * </CardSort>
 * ```
 *
 * @remarks
 * All components that use `useSort` must be children of `CardSort`.
 *
 * @see useSort
 */
export const CardSort = ({ children, className = '' }: CardProps) => {
    const [activeSort, setActiveSort] = useState<string | number | undefined>()

    return (
        <SortContext.Provider value={{ activeSort, setActiveSort }}>
            <div
                className={`w-full h-full ${className}`}
            >
                {children}
            </div>
        </SortContext.Provider>
    )
}

/**
 * Utility function to toggle sort key.
 *
 * Returns `undefined` if the current sort key is the same as the next one,
 * effectively resetting the sort. Otherwise, returns the new sort key.
 *
 * @param current - The currently active sort key
 * @param next - The sort key to be applied
 * @returns The next sort key or `undefined` if toggled off
 *
 * @example
 * ```ts
 * const result = toggleSort('alpha', 'alpha'); // undefined
 * const result = toggleSort('alpha', 'color'); // 'color'
 * ```
 *
 * @remarks
 * Useful for deselecting a sort if the same value is clicked again.
 *
 * @see setActiveSort
 */
const toggleSort = (
    current: string | number | undefined,
    next: string | number
): string | number | undefined => {
    return current === next ? undefined : next
}


/**
 * Clickable sort trigger component.
 *
 * Renders a UI element that updates the active sort key when clicked.
 * If clicked again with the same key, it deselects the sort (resets).
 *
 * @param children - Display content (typically a label or icon)
 * @param className - Optional class name for styling
 * @param sortName - The sort key associated with this component
 * @returns A styled div that updates sort context on click
 *
 * @example
 * ```tsx
 * <CardHeaderSortContent sortName="color">Sort by color</CardHeaderSortContent>
 * ```
 *
 * @remarks
 * The component updates context using `toggleSort` and reflects active state
 * with conditional styling.
 *
 * @see useSort
 * @see toggleSort
 */
export const CardHeaderSortContent = ({
    children,
    className = '',
    sortName,
}: CardSortProps) => {
    const { activeSort, setActiveSort } = useSort()


    return (
        <div
            className={`cursor-pointer hover:text-white ${activeSort === sortName ? 'text-white' : 'text-clear-grey'} ${className}`}
            onClick={() => setActiveSort(toggleSort(activeSort, sortName))}
        >
            {children}
        </div>
    )
}
