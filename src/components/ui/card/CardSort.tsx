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

export const useSort = () => {
    const context = useContext(SortContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

export const CardHeaderSort = ({ children, className = '' }: CardProps) => {
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

const toggleSort = (
    current: string | number | undefined,
    next: string | number
): string | number | undefined => {
    return current === next ? undefined : next
}

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
