import React, { useRef, useState, useEffect } from 'react'
import DropDownArrow, { getStateArrow } from '../Button/DropDownArrow'
import ArrowButton from '../Button/ArrowButton'
import { Calendar } from '@heroui/calendar'
import { AnimatePresence, motion } from 'framer-motion'
import {
    today,
    getLocalTimeZone,
    CalendarDate,
    toCalendarDate,
    fromDate,
} from '@internationalized/date'
import { useClickOutside } from '@/lib/hooks/handleClickoutside'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { useLocale } from 'next-intl'
import { I18nProvider } from '@react-aria/i18n'

export interface ChoseDateState {
    selectedDate: Date
    isLive: boolean
    matchChaud: boolean
    search: string
}

export interface ChoseDateActions {
    setSelectedDate: (date: Date) => void
    setIsLive: (isLive: boolean) => void
    setMatchChaud: (matchChaud: boolean) => void
    setSearch: (search: string) => void
    resetFilters: () => void
}

export interface ChoseDateHelpers {
    dateToCalendarDate: (date: Date) => CalendarDate | null
}

export interface ChoseDateProps
    extends ChoseDateState,
        ChoseDateActions,
        ChoseDateHelpers {
    className?: string
}

export function useChoseDate() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isLive, setIsLive] = useState(false)
    const [matchChaud, setMatchChaud] = useState(false)
    const [search, setSearch] = useState('')

    const resetFilters = () => {
        setIsLive(false)
        setMatchChaud(false)
        setSearch('')
    }

    const dateToCalendarDate = (date: Date): CalendarDate | null => {
        if (!date) return null
        return toCalendarDate(fromDate(date, getLocalTimeZone()))
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
        dateToCalendarDate,
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
    dateToCalendarDate,
}: ChoseDateProps) {
    const { isDown, setIsDown } = getStateArrow()
    const calendarRef = useRef<HTMLDivElement>(null)
    const translate = useTranslate('Calendar')
    const locale = useLocale()
    
    const onChangeDateCalendar = (calendarDate: CalendarDate) => {
        const jsDate = calendarDate?.toDate(getLocalTimeZone()) || null
        setSelectedDate(jsDate)
        setIsDown(true)
    }
    const normalizeLocale = (lang: string) => {
        if (lang.startsWith('fr')) return 'fr-FR'
        if (lang.startsWith('en')) return 'en-US'
        if (lang.startsWith('es')) return 'es-ES'
        return 'en-US'
    }
    const currentLocale = normalizeLocale(locale)
    
    const formatSelectedDate = () => {
        if (!selectedDate) return ''

        const today = new Date()
        const dayMs = 86400000 // 1 jour en ms
        const diff =
            selectedDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)

        switch (diff) {
            case 0:
                return translate('today')
            case dayMs:
                return translate('tomorrow')
            case -dayMs:
                return translate('yesterday')
            default:
                return selectedDate
                    .toLocaleDateString(currentLocale, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                    })
                    .replace(/^\w/, (c) => c.toUpperCase())
        }
    }

    const addOneDay = (date: Date): Date => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() + 1)
        return newDate
    }

    const removeOneDay = (date: Date): Date => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() - 1)
        return newDate
    }

    useClickOutside(calendarRef, () => {
        if (isDown == false) setIsDown(true)
    })

    return (
        <div className="w-full h-31 md:bg-white/6 flex flex-col pt-[5px] pb-[10px] px-[10px] relative default-border-radius">
            <ArrowButton
                className="flex-1"
                onLeftClick={() => setSelectedDate(removeOneDay(selectedDate))}
                onRightClick={() => setSelectedDate(addOneDay(selectedDate))}
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-clear-grey">{formatSelectedDate()}</h3>
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
                        initial={{ opacity: 0, y: -10, scale: 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 1 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-[56px] left-[10px] right-[10px] flex justify-center z-50"
                    >
                        <I18nProvider locale={currentLocale}>
                        <Calendar
                            
                            ref={calendarRef}
                            value={
                                dateToCalendarDate(selectedDate) ||
                                today(getLocalTimeZone())
                            }
                            onChange={(calendarDate) =>
                                onChangeDateCalendar(calendarDate)
                            }
                            classNames={{
                                base: 'bg-white/4 rounded-lg backdrop-blur border border-grey/30',
                                headerWrapper: 'bg-clear-grey/20 rounded-t-lg',
                                title: 'text-lg font-semibold text-white',
                                nextButton: 'text-clear-grey hover:text-white',
                                prevButton: 'text-clear-grey hover:text-white',
                                gridWrapper: 'gap-1',
                                gridHeaderRow: 'mb-2 justify-between px-0',
                                gridHeader:
                                    'text-xs font-medium text-clear-grey bg-clear-grey/20',
                                gridHeaderCell: 'p-0 flex-1',
                                cell: 'p-0 w-10 h-10 flex items-center justify-center',
                                cellButton: [
                                    ' rounded-md text-sm text-clear-grey',
                                    'hover:bg-white/6 hover:text-white',
                                    'data-[selected=true]:bg-white/20 data-[selected=true]:text-white',
                                    'data-[outside-month=true]:text-grey/60',
                                    'transition-colors duration-150',
                                ],
                            }}
                        />
                        </I18nProvider>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className=" flex-1 w-full"></div>
        </div>
    )
}
