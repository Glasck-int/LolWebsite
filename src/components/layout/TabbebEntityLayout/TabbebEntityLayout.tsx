'use client'

import React, {
    useState,
    useContext,
    useEffect,
    isValidElement,
    ReactElement,
    ReactNode,
} from 'react'
import { createContext } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/utils/select'
import { SubTitle } from '@/components/ui/text/SubTitle'

export interface MainProps {
    children: React.ReactNode
    className?: string
}

interface HeaderProps {
    data: {
        [year: string]: {
            split: string[]
            tournament: string[]
        }
    }
    className?: string
}

interface RawProps {
    className?: string
    data: string[]
    all?: boolean
}

interface RawLineProps extends RawProps {
    name:string
}

const LayoutContext = createContext<{
    activeIndex: number
    setActiveIndex: (index: number) => void
    activeSplit: string
    setActiveSplit: (split: string) => void
    activeTournament: string
    setActiveTournament: (tournament: string) => void
} | null>(null)

const HeaderContext = createContext<{
    active: string
    setActive: (active: string) => void
} | null>(null)

export const useLayout = () => {
    const context = useContext(LayoutContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

export const useHeader = () => {
    const context = useContext(HeaderContext)
    if (!context) {
        throw new Error('useCard doit être utilisé dans un composant Card')
    }
    return context
}

export const TabbleEntityLayout = ({ children, className = '' }: MainProps) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [activeSplit, setActiveSplit] = useState("")
    const [activeTournament, setActiveTournament] = useState("")

    return (
        <LayoutContext.Provider value={{ activeIndex, setActiveIndex, activeSplit, setActiveSplit, activeTournament, setActiveTournament }}>
            <div className={`flex flex-col gap-4 ${className}`}>{children}</div>
        </LayoutContext.Provider>
    )
}

export const TabbleEntityHeader = ({ data, className = '' }: HeaderProps) => {
    const years = Object.keys(data)
    years.sort()
    const [active, setActive] = useState(years[years.length - 1])
    const { setActiveSplit, setActiveTournament } = useLayout()

    const split = data[active]["split"]
    const tournament = data[active]["tournament"]

    useEffect(() => {
        if (split.length > 0) setActiveSplit(split[split.length - 1])
        if (tournament.length > 0) setActiveTournament(tournament[tournament.length - 1])
    }, [active, split, tournament, setActiveSplit, setActiveTournament])

    return (
        <HeaderContext.Provider value={{ active, setActive }}>
            <div className={`flex flex-col w-full ${className}`}>
                <TabbleEntityRawSelect data={years} />
                <TabbleEntityRawLine data={split} name="split"/>
                <TabbleEntityRawLine data={tournament} name="tournament"/>
            </div>
        </HeaderContext.Provider>
    )
}

const TabbleEntityRawSelect = ({
    className = '',
    data,
    all = true,
}: RawProps) => {
    const { active, setActive } = useHeader()
    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px]">
                <Select
                    defaultValue={active}
                    onValueChange={(value) => setActive(value)}
                >
                    <SelectTrigger className="border-none p-0 !ring-0 !focus-visible:ring-0 !focus-visible:border-none text-clear-grey font-semibold text-sm md:text-base select-none hover:text-white data-[state=open]:text-white [&_svg]:transition-colors cursor-pointer">
                        <SelectValue placeholder={active} />
                    </SelectTrigger>
                    <SelectContent className="bg-white-04 backdrop-blur text-clear-grey font-semibold text-sm md:text-base border-white/20">
                        {data.map((item, index) => (
                            <SelectItem
                                key={index}
                                value={item}
                                className="hover:!bg-white/20 "
                            >
                                {item}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

const TabbleEntityRawLine = ({
    className = '',
    data,
    all = true,
    name
}: RawLineProps) => {
    const {
        activeSplit,
        setActiveSplit,
        activeTournament,
        setActiveTournament
    } = useLayout();

    const active = name === 'split' ? activeSplit : activeTournament;
    const setActive = name === 'split' ? setActiveSplit : setActiveTournament;

    return (
        <div className={`flex justify-end h-[43px] ${className}`}>
            <div className="px-[15px]">
                <div className="flex justify-end gap-3">
                    {data.map((item, index) => (
                        <SubTitle
                            key={index}
                            onClick={() => setActive(item)}
                            className={` cursor-pointer select-none ${active === item ? 'text-white' : 'text-grey hover:text-clear-grey'}`}

                        >
                            {item}
                        </SubTitle>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const TabbleEntityBody = ({ children, className = '' }: MainProps) => {
    const { activeIndex } = useLayout()

    return (
        <div className={`h-full w-full ${className}`}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    if (index == activeIndex) {
                        return child
                    } else {
                        return null
                    }
                }
                return (
                    <div>
                        ERROR IN TableEntityBody waiting for an
                        React.valideElement
                    </div>
                )
            })}
        </div>
    )
}

export const TabbleEntityContent = ({
    children,
    className = '',
}: MainProps) => {
    return (
        <div className="w-full h-full">
            <div className={`flex flex-col gap-4 h-full w-full ${className}`}>
                {children}
            </div>
        </div>
    )
}
