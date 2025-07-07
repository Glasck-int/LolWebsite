'use client'

import { Tooltip } from '@/components/utils/Tooltip'
import React, {
    useRef,
    useState,
    useEffect,
    ReactNode,
    useLayoutEffect,
    useContext,
} from 'react'
import { createContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CardTabProps {
    onClick: () => void
    isActive: boolean
    children: ReactNode
}

interface CardProps {
    children: React.ReactNode
    className?: string
}

interface CardHeaderProps extends CardSectionProps {
    activeIndex?: number
    setActiveIndex?: (index: number) => void
}

interface CardSectionProps {
    children: React.ReactNode
    className?: string
}

interface CardToolTip {
    children: React.ReactNode
    info: string
    className?: string
}

const CardContext = createContext<{
    activeIndex: number
    setActiveIndex: (index: number) => void
} | null>(null)

const useCard = () => {
    const context = useContext(CardContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

function getHeaderTw(bg = true) {
    let str = 'w-full flex items-center h-full '
    return bg ? str + 'bg-white-04 ' : str
}

export const Card = ({ children, className }: CardProps) => {
    const [activeIndex, setActiveIndex] = useState(0)

    return (
        <CardContext.Provider value={{ activeIndex, setActiveIndex }}>
            <div
                className={
                    'bg-white-06 default-border-radius h-full w-full flex flex-col justify-evenly backdrop-blur ' +
                    className
                }
            >
                {children}
            </div>
        </CardContext.Provider>
    )
}

export const CardToolTip = ({ children, className, info }: CardToolTip) => {
    const [self, setSelf] = useState<HTMLElement | null>(null)
    const selfRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setSelf(selfRef.current)
    }, [selfRef])

    return (
        <div
            ref={selfRef}
            className={
                'justify-between min-h-[35px] md:min-h-[40px]' +
                ' ' +
                getHeaderTw() +
                className
            }
        >
            {children}
            <Tooltip content={info}>
                <p>ici</p>
            </Tooltip>
        </div>
    )
}

export const CardHeaderBase = ({ children, className }: CardSectionProps) => {
    return (
        <div
            className={
                'content-center min-h-[35px] md:min-h-[40px]' +
                ' ' +
                getHeaderTw() +
                className
            }
        >
            {children}
        </div>
    )
}

export const CardHeaderSelector = ({
    children,
    className,
}: CardSectionProps) => {
    const { activeIndex, setActiveIndex } = useCard()

    return (
        <div className="flex">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return (
                        <div
                            className={` cursor-pointer ${
                                activeIndex === index
                                    ? 'text-white'
                                    : 'text-grey'
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

export const CardHeaderColumn = ({ children, className }: CardSectionProps) => {
    return (
        <div className={'flex flex-col w-full' + ' ' + className}>
            {children}
        </div>
    )
}

export const CardHeaderTab = ({ children, className }: CardSectionProps) => {
    const { activeIndex, setActiveIndex } = useCard()
    const tabCount = React.Children.count(children)
    const tabWidth = 100 / tabCount
    const [isAnimating, setIsAnimating] = useState(false)

    return (
        <div
            className={
                'relative w-full flex items-stretch justify-evenly content-center min-h-[42px] md:min-h-[45px]' +
                ' ' +
                className
            }
        >
            {/* Slider anim */}
            <motion.div
                className="absolute bottom-0 top-0 left-0 bg-white-04 default-top-border-radius z-0"
                layout
                initial={false}
                animate={{
                    transform: `translateX(${100 * activeIndex}%)`,
                    width: `${tabWidth}%`,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
            />

            {/* Tabs */}
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return (
                        <div
                            className={`z-10 flex-1 text-center cursor-pointer px-2 py-2 transition-colors duration-300 ${
                                activeIndex === index
                                    ? 'text-white'
                                    : 'text-grey'
                            } ${className ?? ''}`}
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

export const CardHeader = ({ children, className }: CardSectionProps) => {
    return (
        <div
            className={`w-full default-top-border-radius text-sm color-grey  flex items-center ${
                className ?? ''
            }`}
        >
            {children}
        </div>
    )
}

export const CardBody = ({ children, className }: CardSectionProps) => {
    return (
        <div className={`flex grow-1 ${className ?? ''}`}>
            {children}
        </div>
    )
}

export const CardBodyMultiple = ({ children }: CardSectionProps) => {
    const { activeIndex } = useCard()
    return (
        <div className="h-full w-full">
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    if (index == activeIndex) {
                        return (
                            <CardBodyMultipleDiv>{child}</CardBodyMultipleDiv>
                        )
                    } else {
                        return null
                    }
                }
                return <div>ERROR IN CardBodyMultiple</div>
            })}
        </div>
    )
}

const CardBodyMultipleDiv = ({ children }: CardSectionProps) => {
    return <div className="h-full w-full">{children}</div>
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
