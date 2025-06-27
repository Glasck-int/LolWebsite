import React, { useState } from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
    content: React.ReactNode
    children?: React.ReactNode
    align?: 'start' | 'center' | 'end'
}

export const Tooltip = ({
    content,
    children,
    align = 'center',
}: TooltipProps) => {
    const [visible, setVisible] = useState(false)

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children ? children : <Info color="#dddddd" />}
            {visible && (
                <div className="absolute bottom-full text-white text-sm rounded z-50 bg-black px-2 py-1 mb-2 max-w-full">
                    {content}
                </div>
            )}
        </div>
    )
}

//left-1/2 -translate-x-1/2 bg-black text-white text-sm px-2 py-1 rounded z-50 whitespace-nowrap
