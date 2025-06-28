import React, { useState } from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
    content: React.ReactNode
    children?: React.ReactNode
}

export const Tooltip = ({ content, children }: TooltipProps) => {
    const [visible, setVisible] = useState(false)

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children ? children : <Info/>}
            {visible && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-2 py-1 rounded z-50 whitespace-nowrap">
                    {content}
                </div>
            )}
        </div>
    )
}