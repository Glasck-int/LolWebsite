import React from 'react'
import { ChevronUp } from 'lucide-react'

interface DropDownProps {
    className?: string
    arrowColor?:string
    isDown: boolean
    setIsDown: (value: boolean) => void
}

// Custom hook for managing dropdown arrow state
export const useDropdownArrow = (isDownByDefault: boolean = true) => {
    const [isDown, setIsDown] = React.useState(isDownByDefault)

    return {
        isDown,
        setIsDown
    }
}

export default function DropDownArrow({
    className = '',
    isDown,
    setIsDown,
    arrowColor="#373737"
}: DropDownProps) {
    return (
        <div
            className={`flex bg-white/35 w-[20px] h-[20px] md:w-[25px] md:h-[25px] rounded-full items-center justify-center cursor-pointer ${className}`}
            onClick={() => setIsDown(!isDown)}
        >
            <div
                className={`transition-transform duration-300 ease-in-out ${
                    isDown ? 'rotate-180' : 'rotate-0'
                }`}
            >
                <ChevronUp color={arrowColor} />
            </div>
        </div>
    )
}
