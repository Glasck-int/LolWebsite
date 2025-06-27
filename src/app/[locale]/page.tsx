'use client'

import { Header } from '@/app/components/layout/Header'
import { OneHeaderCard } from '../components/ui/card/OneHeaderCard'
import { TestHeader } from '../components/ui/card/header/TestHeader'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <Header />
            <div className="h-[1000px] w-full pt-[80px]">
                <div className="mt-4 h-72">
                </div>
            </div>
        </div>
    )
}
