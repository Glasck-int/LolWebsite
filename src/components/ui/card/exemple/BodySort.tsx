'use client'

import React from 'react'
import { useSort } from '../CardSort'

const strings = [
    'blue 42',
    'green 7',
    'red 123',
    'yellow 3',
    'cyan 88',
    'pink 9',
]

const getNumberCount = (str: string) => {
    const matches = str.match(/\d+/g)
    return matches ? matches.reduce((sum, num) => sum + parseInt(num), 0) : 0
}

const getColorValue = (str: string) => {
    const colorPriority = ['red', 'pink', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple']
    const match = colorPriority.find(color => str.includes(color))
    return match ? colorPriority.indexOf(match) : colorPriority.length
}

export const SortedList = () => {
    const { activeSort } = useSort()

    const sorted = [...strings].sort((a, b) => {
        const key = activeSort?.key
        const direction = activeSort?.direction

        // Pas de tri actif
        if (!key || !direction) return 0

        let comparison = 0

        switch (key) {
            case 'alpha':
                comparison = a.localeCompare(b)
                break
            case 'color':
                comparison = getColorValue(a) - getColorValue(b)
                break
            case 'numb':
                comparison = getNumberCount(a) - getNumberCount(b)
                break
            default:
                comparison = 0
        }

        // Appliquer le sens (asc ou desc)
        return direction === 'asc' ? comparison : -comparison
    })

    return (
        <div className="flex flex-col gap-2 p-4 text-white">
            {sorted.map((str, idx) => (
                <div key={idx} className="px-2 py-1 bg-zinc-700 rounded">
                    {str}
                </div>
            ))}
        </div>
    )
}