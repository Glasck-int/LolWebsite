'use client'

import React from 'react'
import { Switch } from './switch2'

interface OfficialToggleProps {
    onlyOfficial: boolean
    onToggle: (value: boolean) => void
    className?: string
}

/**
 * Official leagues toggle component
 *
 * A toggle button to filter between official and all leagues
 *
 * @param onlyOfficial - Current state of the toggle
 * @param onToggle - Callback function when toggle changes
 * @param className - Additional CSS classes
 * @returns A toggle button component
 *
 * @example
 * ```ts
 * <OfficialToggle
 *   onlyOfficial={onlyOfficial}
 *   onToggle={setOnlyOfficial}
 * />
 * ```
 */
export const OfficialToggle = ({
    onlyOfficial,
    onToggle,
    className = '',
}: OfficialToggleProps) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <Switch
                onClick={() => onToggle(!onlyOfficial)}

                role="switch"
                aria-checked={onlyOfficial}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        onlyOfficial ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </Switch>
            <span className="text-sm text-gray-300">
                Officiel
            </span>
            {/* <span className="text-xs text-gray-400">
                {onlyOfficial ? 'Activé' : 'Désactivé'}
            </span> */}
        </div>
    )
}
