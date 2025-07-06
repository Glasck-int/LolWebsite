'use client'

import { useEffect, useState } from 'react'

/**
 * TimeDisplay component displays the time and date of a match
 *
 * @param dateTime_UTC - The date and time of the match in UTC
 * @returns JSX element displaying the time and date of the match
 */
export const TimeDisplay = ({
    dateTime_UTC,
}: {
    dateTime_UTC: Date | null
}) => {
    const [browserLanguage, setBrowserLanguage] = useState('en-US')
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
        setBrowserLanguage(navigator.language)
    }, [])

    if (!dateTime_UTC) return <span>TBD</span>

    // Use a default language during SSR to avoid hydration mismatch
    const currentLanguage = isClient ? browserLanguage : 'en-US'

    const localDate = new Date(dateTime_UTC)

    // Get the time with AM/PM separated
    const timeString = localDate.toLocaleTimeString(currentLanguage, {
        hour: '2-digit',
        minute: '2-digit',
    })

    // Extract AM/PM if present
    const timeParts = timeString.split(' ')
    const timeOnly = timeParts[0]
    const amPm = timeParts[1]

    return (
        <>
            <div className="flex flex-col items-center">
                <span className="font-semibold text-white text-xl">
                    {timeOnly}
                </span>
                {amPm && (
                    <span className="text-xs text-clear-grey font-medium">
                        {amPm}
                    </span>
                )}
            </div>
            <span className="text-sm text-clear-grey mt-3">
                {localDate.toLocaleDateString(currentLanguage, {
                    day: '2-digit',
                    month: 'short',
                })}
            </span>
        </>
    )
}
