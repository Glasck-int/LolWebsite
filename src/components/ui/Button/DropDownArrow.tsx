import React from 'react'
import { ChevronUp } from 'lucide-react'
import { useMediaQuery } from '@/lib/hooks/getMediaQuery'

interface DropDownProps {
    className?: string
    arrowColor?: string
    isDown: boolean
    setIsDown: (value: boolean) => void
    sizeMd?: number
    size?: number
    ref?:React.Ref<HTMLDivElement> | undefined
}

// Custom hook for managing dropdown arrow state
export const useDropdownArrow = (isDownByDefault: boolean = true) => {
    const [isDown, setIsDown] = React.useState(isDownByDefault)

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
    ref
}: DropDownProps) {
    const isMd = useMediaQuery('(min-width: 768px)') 
    const iconSize = isMd ? sizeMd : size
    return (
        <div
            ref={ref && ref}
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
