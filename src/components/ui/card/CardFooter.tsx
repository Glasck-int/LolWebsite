'use client'

import React, {useState, useEffect, useRef} from 'react'
import { CardProps } from './Card'
import { motion } from 'framer-motion'
import { useLayout } from '@/components/layout/TabbebEntityLayout/TabbebEntityLayout'

export const CardFooter = ({ children, className = '' }: CardProps) => {
    const { activeIndex, setActiveIndex } = useLayout()
    const tabCount = React.Children.count(children)

    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState(0)

    useEffect(() => {
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    setContainerWidth(entry.contentRect.width)
                }
            })
            resizeObserver.observe(containerRef.current)

            // initial size
            setContainerWidth(containerRef.current.clientWidth)

            return () => resizeObserver.disconnect()
        }
    }, [])

    const tabWidth = containerWidth / tabCount
    const barWidth = tabWidth * 0.8
    const offset = (tabWidth * 0.1 + tabWidth * activeIndex) +  15

    return (
        <div className={`w-full default-bot-border-radius text-sm color-grey bg-white-04 h-[45px] md:h-[50px] ${className}`}>
            <div
                ref={containerRef}
                className="relative flex items-center justify-between md:justify-start px-[15px] h-full gap-2"
            >
                <motion.div
                    className="absolute bottom-0 h-[3px] bg-clear-violet rounded-t-md"
                    animate={{
                        width: barWidth,
                        left: offset,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                    }}
                />
                {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child)) {
                        return (
                            <div
                                className={`z-10 flex-1 md:flex-0 text-center cursor-pointer select-none px-2 py-2 transition-colors duration-100 md:min-w-[150px] ${
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
                    return <div>ERROR IN CardFooter</div>
                })}
            </div>
        </div>
    )
}

export const CardFooterContent = ({ children, className = '' }: CardProps) => {
    return <div className={'w-full h-full' + ' ' + className}>{children}</div>
}