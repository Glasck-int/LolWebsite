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

export const useCard = () => {
    const context = useContext(CardContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

// Components

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

// super css pour faire des slide undertab (regarder sur gpt)
// <motion.div
//     className="absolute bottom-0 h-[2px] bg-blue-500"
//     animate={{
//         width: `${tabWidth}%`,
//         left: `${tabWidth * activeIndex}%`,
//     }}
//     transition={{
//         type: "spring",
//         stiffness: 300,
//         damping: 30,
//     }}
// />
