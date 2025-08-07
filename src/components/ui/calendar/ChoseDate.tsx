import { useQueryDate } from '@/lib/hooks/createQueryState'
import React, { useRef, useState } from 'react'
import DropDownArrow, { useDropdownArrow } from '../Button/DropDownArrow'
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
import { ButtonBar } from '../Button/ButtonBar'
import { FunctionalSearchBar } from '../search/FunctionalSearchBar'

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
}

export interface ChoseDateHelpers {
    dateToCalendarDate: (date: Date) => CalendarDate | null
}

export interface ChoseDateProps
    extends ChoseDateState,
        ChoseDateActions,
        ChoseDateHelpers {
    className?: string
    weekDisplay?:boolean
    minDate?: Date
    maxDate?: Date
}

/**
 * Custom hook to manage the state and logic for the ChoseDate component.
 *
 * Handles selected date, "live" status, "hot match" toggle, and search query. It also provides a helper to convert JS dates to `CalendarDate`.
 *
 * @returns An object containing the selected date state, update functions, and a date conversion helper.
 *
 * @example
 * ```ts
 * const {
 *   selectedDate, setSelectedDate,
 *   isLive, setIsLive,
 *   matchChaud, setMatchChaud,
 *   search, setSearch,
 *   dateToCalendarDate
 * } = useChoseDate();
 * ```
 *
 * @remarks
 * Useful as a state provider for the `<ChoseDate />` component, especially when composing or testing logic separately.
 *
 * @see `ChoseDate` component
 */
export function useChoseDate() {
    const [selectedDate, setSelectedDate] = useQueryDate("date", new Date())
    const [isLive, setIsLive] = useState(false)
    const [matchChaud, setMatchChaud] = useState(false)
    const [search, setSearch] = useState('')
    
    
    /**
     * Converts a JavaScript Date to a CalendarDate format used by @internationalized/date.
     *
     * @param date - A standard JavaScript Date object
     * @returns A CalendarDate object if the input is valid, otherwise null
     *
     * @example
     * ```ts
     * const calendarDate = dateToCalendarDate(new Date());
     * ```
     *
     * @remarks
     * Useful for adapting native dates to the Calendar component’s expected format.
     *
     * @see fromDate, toCalendarDate
     */
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
        dateToCalendarDate,
    }
}

/**
 * UI component allowing users to select a date, toggle filters like "live" or "hot match", and perform a search.
 *
 * Includes navigation buttons to shift days, a calendar popover, and an optional week-based display mode.
 *
 * @param selectedDate - The currently selected date.
 * @param setSelectedDate - Function to update the selected date.
 * @param setIsLive - Function to toggle the "live" match filter.
 * @param setMatchChaud - Function to toggle the "hot match" filter.
 * @param setSearch - Function to set the search query.
 * @param dateToCalendarDate - Helper function to convert a JS Date to `CalendarDate`.
 * @param className - Optional className for custom styling.
 * @param weekDisplay - Whether to display the calendar with week grouping (not used internally yet).
 * @returns A nav element rendering the full interactive date chooser UI.
 *
 * @example
 * ```tsx
 * calendarData = useChoseDate()
 * <ChoseDate {...calendarData} />
 * ```
 *
 * @remarks
 * Combines state, internationalization, animation, and accessibility using tools like `@heroui/calendar`, `framer-motion`, and `@react-aria/i18n`.
 *
 * @see `useChoseDate` for the state hook usually used alongside this component
 */
export default function ChoseDate({
    selectedDate,
    setSelectedDate,
    setIsLive,
    setMatchChaud,
    setSearch,
    className = '',
    dateToCalendarDate,
    minDate,
    maxDate
}: ChoseDateProps) {
    const { isDown, setIsDown } = useDropdownArrow()
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

        const todayDate = new Date()
        const dayMs = 86400000
        const diff =
            selectedDate.setHours(0, 0, 0, 0) - todayDate.setHours(0, 0, 0, 0)

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
        
        // Check if we exceed maxDate
        if (maxDate && newDate > maxDate) {
            return date // Return original date if we would exceed max
        }
        
        return newDate
    }

    const removeOneDay = (date: Date): Date => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() - 1)
        
        // Check if we go below minDate
        if (minDate && newDate < minDate) {
            return date // Return original date if we would go below min
        }
        
        return newDate
    }

    useClickOutside(calendarRef, () => {
        if (isDown == false) setIsDown(true)
    })

    const handleButtonClick = (option: string | null) => {
        if (!option) {
            setIsLive(false)
            setMatchChaud(false)
            setSearch('')
            return
        }

        if (option === translate('live')) {
            setIsLive(true)
            setMatchChaud(false)
        }

        if (option === translate('hotGame')) {
            setMatchChaud(true)
            setIsLive(false)
        }
    }

    const handleSearch = (term: string) => {
        setSearch(term)
    }

    // Vérifier si on est au premier ou dernier jour
    const isFirstDay = minDate && selectedDate.toDateString() === minDate.toDateString()
    const isLastDay = maxDate && selectedDate.toDateString() === maxDate.toDateString()

    return (
        <nav className={`w-full h-31 md:bg-white/6 flex flex-col pt-[5px] pb-[10px] px-[10px] relative default-border-radius ${className}`}>
            <ArrowButton
                className="flex-1"
                onLeftClick={() => setSelectedDate(removeOneDay(selectedDate))}
                onRightClick={() => setSelectedDate(addOneDay(selectedDate))}
                leftDisabled={isFirstDay}
                rightDisabled={isLastDay}
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-clear-grey"><time>{formatSelectedDate()}</time></h3>
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
                                minValue={minDate ? dateToCalendarDate(minDate) : undefined}
                                maxValue={maxDate ? dateToCalendarDate(maxDate) : undefined}
                                classNames={{
                                    base: 'bg-white/4 rounded-lg backdrop-blur border border-grey/30',
                                    headerWrapper:
                                        'bg-clear-grey/20 rounded-t-lg',
                                    title: 'text-lg font-semibold text-white',
                                    nextButton:
                                        'text-clear-grey hover:text-white',
                                    prevButton:
                                        'text-clear-grey hover:text-white',
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
            <div className=" flex-1 w-full ">
                <div className="flex gap-2 ">
                    <ButtonBar
                        options={[translate('live'), translate('hotGame')]}
                        onButtonChange={(option) => handleButtonClick(option)}
                    />
                    <div className="flex-1 min-w-0">
                        <FunctionalSearchBar
                            searchLogo="textSearch"
                            className="h-[40px] !rounded-2xl border md:border-none border-solid border-dark-grey bg-white-06"
                            onSearch={handleSearch}
                        />
                    </div>
                </div>
            </div>
        </nav>
    )
}
