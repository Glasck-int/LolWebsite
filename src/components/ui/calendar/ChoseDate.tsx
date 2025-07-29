import React, { useState } from 'react'
import DropDownArrow, { getStateArrow } from '../Button/DropDownArrow'
import ArrowButton from '../Button/ArrowButton'
import { Calendar } from '@heroui/calendar'
import { AnimatePresence, motion } from 'framer-motion'

export interface ChoseDateState {
    selectedDate: Date | null
    isLive: boolean
    matchChaud: boolean
    search: string
}

export interface ChoseDateActions {
    setSelectedDate: (date: Date | null) => void
    setIsLive: (isLive: boolean) => void
    setMatchChaud: (matchChaud: boolean) => void
    setSearch: (search: string) => void
    resetFilters: () => void
}

export interface ChoseDateHelpers {}

export interface ChoseDateProps
    extends ChoseDateState,
        ChoseDateActions,
        ChoseDateHelpers {
    className?: string
}

export function useChoseDate() {
    const [selectedDate, setSelectedDate] = useState(null)
    const [isLive, setIsLive] = useState(false)
    const [matchChaud, setMatchChaud] = useState(false)
    const [search, setSearch] = useState('')

    const resetFilters = () => {
        setIsLive(false)
        setMatchChaud(false)
        setSearch('')
    }

    return {
        // States
        selectedDate,
        isLive,
        matchChaud,
        search,
        // Setters
        setSelectedDate,
        setIsLive,
        setMatchChaud,
        setSearch,
        // Helpers
        resetFilters,
    }
}

export default function ChoseDate({
    selectedDate,
    setSelectedDate,
    isLive,
    setIsLive,
    matchChaud,
    setMatchChaud,
    search,
    setSearch,
    className = '',
}: ChoseDateProps) {
    const { isDown, setIsDown } = getStateArrow()

    return (
        <div className="w-full h-31 md:bg-white/6 flex flex-col pt-[5px] pb-[10px] px-[10px] relative">
            <ArrowButton className="flex-1">
                <div className="flex gap-2 items-center">
                    <h3 className="text-clear-grey">Aujourd'hui</h3>
                    <DropDownArrow
                        size={15}
                        sizeMd={20}
                        isDown={isDown}
                        setIsDown={setIsDown}
                    />
                </div>
            </ArrowButton>

            <AnimatePresence>
                {!isDown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-[56px] left-[10px] right-[10px] flex justify-center z-50"
                    >
                        <Calendar
                            className=""
                            classNames={{
                                base: 'bg-white/4 rounded-lg backdrop-blur border border-grey',
                                headerWrapper: 'bg-clear-grey/20 ',
                                title: 'text-lg font-semibold text-white',
                                gridWrapper: 'gap-1',
                                gridHeaderRow: 'mb-2',
                                gridHeaderCell:
                                    'text-xs font-medium text-gray-500 p-2',
                                gridBodyRow: 'gap-1',
                                cell: 'p-0',
                                cellButton: [
                                    'w-10 h-10 rounded-md text-sm',
                                    'hover:bg-blue-50 hover:text-blue-600',
                                    'data-[selected=true]:bg-blue-500 data-[selected=true]:text-white',
                                    'data-[today=true]:bg-blue-100 data-[today=true]:text-blue-700',
                                    'data-[outside-month=true]:text-gray-300',
                                    'transition-colors duration-150',
                                ],
                                nextButton:
                                    'text-white hover:text-blue-600 hover:bg-blue-50 rounded-md p-1',
                                prevButton:
                                    'text-white hover:text-blue-600 hover:bg-blue-50 rounded-md p-1',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className=" flex-1 w-full"></div>
        </div>
    )
}
