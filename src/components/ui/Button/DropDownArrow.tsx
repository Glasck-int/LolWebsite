import React, { useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { getMediaQuery } from '@/lib/hooks/getMediaQuery'

interface DropDownProps {
    className?: string
    arrowColor?: string
    isDown: boolean
    setIsDown: (value: boolean) => void
    sizeMd?: number
    size?: number
}

export const getStateArrow = (isDownByDefault: boolean = true) => {
    const [isDown, setIsDown] = useState(isDownByDefault)

    return {
        isDown,
        setIsDown,
    }
}

export default function DropDownArrow({
    className = '',
    isDown,
    setIsDown,
    arrowColor = '#373737',
    size = 20,
    sizeMd = 20,
}: DropDownProps) {
    const isMd = getMediaQuery('(min-width: 768px)') 
    const iconSize = isMd ? sizeMd : size
    return (
        <div
            className={`flex bg-white/35 rounded-full items-center justify-center cursor-pointer ${className}`}
            onClick={() => setIsDown(!isDown)}
        >
            <div
                className={`transition-transform duration-300 ease-in-out ${
                    isDown ? 'rotate-180' : 'rotate-0'
                }`}
            >
                <ChevronUp color={arrowColor} height={iconSize} width={iconSize}/>
            </div>
        </div>
    )
}
