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
import { motion } from 'framer-motion'

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
    let str = 'w-full flex items-center px-[14px] h-full '
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

export const CardOneHeader = ({ children, className }: CardSectionProps) => {
    return (
        <div
            className={
                'justify-start content-center min-h-[35px] md:min-h-[40px]' +
                ' ' +
                getHeaderTw() +
                className
            }
        >
            {children}
        </div>
    )
}

export const CardDoubleHeader = ({ children, className }: CardSectionProps) => {
    return (
        <div className={'flex flex-col w-full' + ' ' + className}>
            {children}
        </div>
    )
}

export const CardDoubleHeaderTop = ({
    children,
    className,
}: CardSectionProps) => {
    const { activeIndex, setActiveIndex } = useCard()
    const tabCount = React.Children.count(children)
    const tabWidth = 100 / tabCount
    return (
        <div
            className={
                'w-full flex items-stretch justify-evenly content-center min-h-[42px] md:min-h-[45px]' +
                ' ' +
                className
            }
        >
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return (
                        <CardDOubleHeaderTopDiv
                            onClick={() => setActiveIndex(index)}
                            isActive={activeIndex == index}
                        >
                            {child}
                        </CardDOubleHeaderTopDiv>
                    )
                }
                return <div>ERROR IN CardDoubleHeaderTop</div>
            })}

        </div>
    )
}

const CardDOubleHeaderTopDiv = ({
    children,
    isActive,
    onClick,
}: CardTabProps) => {
    return (
        <div
            className={`flex grow-1 justify-center items-center default-top-border-radius ${
                isActive ? 'bg-white-04' : ''
            }`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export const CardDoubleHeaderBot = ({
    children,
    className,
}: CardSectionProps) => {
    return <CardOneHeader className={className}>{children}</CardOneHeader>
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
        <div className={`flex grow-1 px-[15px] ${className ?? ''}`}>
            {children}
        </div>
    )
}

export const CardBodyMultiple = ({ children }: CardSectionProps) => {
    const { activeIndex} = useCard()
    return (
        <div className='h-full w-full'>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    if (index == activeIndex){
                        return (
                            <CardBodyMultipleDiv>
                                {child}
                            </CardBodyMultipleDiv>
                        )
                    }
                    else{
                        return 
                    }
                }
                return <div>ERROR IN CardBodyMultiple</div>
            })}
        </div>
    )
}

const CardBodyMultipleDiv = ({children}: CardSectionProps)=> {
    return (
        <div className='h-full w-full'>
           {children}
        </div>
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