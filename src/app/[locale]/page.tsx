'use client'
import ChoseDate, { useChoseDate } from '@/components/ui/calendar/ChoseDate'
import {
    useQueryDate,
    useQueryString,
    useQueryBoolean,
    useQueryNumber,
} from '@/lib/hooks/createQueryState'

import Footer from '@/components/layout/Footer/Footer'

export default function Home() {

    return (
        <div className="">
            <Footer />
        </div>
    )
}
