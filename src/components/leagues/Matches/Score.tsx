import React, { useState } from 'react'
import { useSpoiler } from '@/contexts/SpoilerContext'

interface SpoilerWrapperProps {
    children: React.ReactNode
}

const SpoilerWrapper = ({ children }: SpoilerWrapperProps) => {
    const { isSpoilerVisible } = useSpoiler()
    const [isLocallyVisible, setIsLocallyVisible] = useState(false)

    // Si les spoilers sont activés globalement, ou révélés localement, afficher le contenu
    if (isSpoilerVisible || isLocallyVisible) {
        return <>{children}</>
    }

    // Si les spoilers ne sont pas activés, afficher le message spoiler cliquable
    return (
        <div 
            className="flex flex-col items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => setIsLocallyVisible(true)}
        >
            <span className="text-gray-400 text-sm italic">
                [Spoiler]
            </span>
        </div>
    )
}   

export default SpoilerWrapper