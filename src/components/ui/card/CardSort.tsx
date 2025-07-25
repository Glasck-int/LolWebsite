'use client'

import React, { useContext, createContext, useState, ReactNode } from 'react'
import { ChildAndClassname } from './Card'
import { ArrowUp } from 'lucide-react'
import { Tooltip } from '@/components/utils/Tooltip'

interface CardSortProps {
    children: ReactNode
    className?: string
    sortName: string
    tooltip?: string
}

type SortDirection = 'asc' | 'desc' | null

type SortState = {
    key: string | null
    direction: SortDirection
}

const SortContext = createContext<{
    activeSort: SortState
    setActiveSort: (key: string) => void
} | null>(null)

/**
 * Provides the current sort state and a method to update it.
 *
 * Must be used within a `CardSort` provider. Throws an error otherwise.
 *
 * @returns The current active sort state and the function to change it.
 *
 * @throws Error - If used outside of a `CardSort` component.
 */
export const useSort = () => {
    const context = useContext(SortContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

/**
 * CardSort component that wraps children with sort context.
 *
 * Maintains the active sort key and direction state, and provides logic to toggle
 * between ascending, descending, and no sort.
 *
 * @param children - The content that will consume the sorting context.
 * @param className - Optional additional className for styling.
 * @returns A context provider wrapping the children.
 *
 * @example
 *
 * <CardSort>
 *   <CardHeaderSortContent sortName="alpha">Sort A-Z</CardHeaderSortContent>
 *   <CardBody>...</CardBody>
 * </CardSort>
 */
export const CardSort = ({ children, className = '' }: ChildAndClassname) => {
    const [activeSort, setSortState] = useState<SortState>({
        key: null,
        direction: null,
    })

    const setActiveSort = (key: string) => {
        setSortState((prev) => {
            if (prev.key !== key) return { key, direction: 'asc' }
            if (prev.direction === 'asc') return { key, direction: 'desc' }
            if (prev.direction === 'desc') return { key: null, direction: null }
            return { key, direction: 'asc' } // fallback
        })
    }

    return (
        <SortContext.Provider value={{ activeSort, setActiveSort }}>
            <div className={`w-full h-full ${className}`}>{children}</div>
        </SortContext.Provider>
    )
}

/**
 * CardHeaderSortContent component to display a sortable header label.
 *
 * Highlights the current active sort and displays an arrow icon indicating direction.
 * Clicking toggles the sort state (asc → desc → none).
 *
 * @param children - The label to be displayed (usually a string or element).
 * @param className - Optional class names for custom styling.
 * @param sortName - A unique key representing the sorting type this header controls.
 * @returns A styled div with an interactive sort label and optional direction icon.
 *
 * @example
 *
 * <CardHeaderSortContent sortName="numb">By Number</CardHeaderSortContent>
 */
export const CardHeaderSortContent = ({
    children,
    className = '',
    sortName,
    tooltip,
}: CardSortProps) => {
    const { activeSort, setActiveSort } = useSort()

    const isActive = activeSort.key === sortName

    const content = (
        <div
            className={`relative cursor-pointer hover:text-white  ${
                activeSort.key === sortName ? 'text-white' : 'text-clear-grey'
            } 
            ${className}`}
            onClick={() => setActiveSort(sortName)}
        >
            <span className="inline-block relative w-fit">
                {children}
                {isActive && (
                    <span className="absolute -right-3.5 top-1/3 md:top-1/5 -translate-y-1/2 transform scale-50 md:scale-75">
                        <ArrowUp
                            className={`transition-transform duration-200 ${
                                activeSort.direction === 'desc'
                                    ? 'rotate-180'
                                    : ''
                            }`}
                            size={16}
                            color="#bab9b9"
                        />
                    </span>
                )}
            </span>
        </div>
    )

    if (tooltip) {
        return (
            <div className={className}>
                <Tooltip content={tooltip}>
                    <div
                        className={`relative cursor-pointer hover:text-white  text-center ${
                            activeSort.key === sortName
                                ? 'text-white'
                                : 'text-clear-grey'
                        }`}
                        onClick={() => setActiveSort(sortName)}
                    >
                        <span className="inline-block relative w-fit">
                            {children}
                            {isActive && (
                                <span className="absolute -right-3.5 top-1/3 md:top-1/5 -translate-y-1/2 transform scale-50 md:scale-75">
                                    <ArrowUp
                                        className={`transition-transform duration-200 ${
                                            activeSort.direction === 'desc'
                                                ? 'rotate-180'
                                                : ''
                                        }`}
                                        size={16}
                                        color="#bab9b9"
                                    />
                                </span>
                            )}
                        </span>
                    </div>
                </Tooltip>
            </div>
        )
    }

    return content
}
