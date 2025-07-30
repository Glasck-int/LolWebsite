'use client'

import React from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { ReactNode, useTransition, useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface LocaleSwitcherSelectProps {
    children: ReactNode
    defaultValue: string
    label: string
    showOnMobile?: boolean
    className?: string
}

/**
 * Custom locale switcher select component with SVG flags
 *
 * A glass-morphism styled custom select dropdown for changing the application language.
 * Displays SVG flags next to language names and maintains the current route while switching locales.
 *
 * @param children - ReactNode elements to render inside the select
 * @param defaultValue - The currently selected locale value
 * @param label - Accessibility label for the select element
 * @param showOnMobile - Whether to show the select on mobile
 * @returns A JSX element representing the locale switcher
 *
 * @example
 * ```ts
 * <LocaleSwitcherSelect defaultValue="en" label="Change language">
 *   <option value="en">English</option>
 *   <option value="fr">Français</option>
 * </LocaleSwitcherSelect>
 * ```
 *
 * @remarks
 * Uses the glass-morphism design pattern with backdrop blur and semi-transparent
 * white background. Transitions are handled smoothly with React's useTransition.
 * Displays SVG flags from public/flags/svg/ directory.
 */
export default function LocaleSwitcherSelect({
    children,
    defaultValue,
    label,
    className,
}: LocaleSwitcherSelectProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(defaultValue)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, dropdownRef])

    function onSelectChange(value: string) {
        setSelectedValue(value)
        setIsOpen(false)
        startTransition(() => {
            router.replace({ pathname }, { locale: value })
        })
    }

    // Get flag path for locale
    const getFlagPath = (locale: string) => {
        if (locale === 'en') return '/flags/svg/us.svg'
        if (locale === 'fr') return '/flags/svg/fr.svg'
        return '/flags/svg/us.svg' // fallback
    }

    // Get display text for locale
    const getDisplayText = (locale: string) => {
        if (locale === 'en') return 'En'
        if (locale === 'fr') return 'Fr'
        return locale
    }

    return (
        <div className={`relative md:block ${className}`} ref={dropdownRef}>
            <p className="sr-only">{label}</p>

            {/* Custom select button */}
            <button
                className="
					appearance-none 
					bg-white/10 
					backdrop-blur-md 
					border 
					border-white/10 
					rounded-md 
					px-3 
					py-2 
					text-white 
					text-sm 
					font-medium 
					cursor-pointer 
					transition-all 
					duration-200 
					hover:bg-white/20 
					focus:outline-none 
					focus:ring-2 
					focus:ring-white/30 
					focus:border-white/30
					disabled:opacity-50 
					disabled:cursor-not-allowed
					min-w-[80px]
					flex
					items-center
					justify-between
				"
                disabled={isPending}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="flex items-center gap-2">
                    {getDisplayText(selectedValue)}
                    <Image
                        src={getFlagPath(selectedValue)}
                        alt={`${selectedValue} flag`}
                        className="w-4 h-4 object-contain"
                        width={16}
                        height={16}
                    />
                </span>

                {/* Custom dropdown arrow */}
                <svg
                    className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Dropdown options */}
            {isOpen && (
                <div
                    className="
					absolute 
					top-full 
					left-0 
					right-0 
					mt-1 
					bg-white/10 
					backdrop-blur-md 
					border 
					border-white/10 
					rounded-md 
					overflow-hidden
					z-50
				"
                >
                    {React.Children.map(children, (child) => {
                        if (
                            React.isValidElement(child) &&
                            child.type === 'option'
                        ) {
                            const value = (
                                child as React.ReactElement<{ value: string }>
                            ).props.value
                            return (
                                <button
                                    key={value}
                                    className="
										w-full 
										px-3 
										py-2 
										text-left 
										text-white 
										text-sm 
										font-medium 
										hover:bg-white/20 
										transition-colors 
										duration-150
										flex 
										items-center 
										justify-between
									"
                                    onClick={() => onSelectChange(value)}
                                >
                                    <span className="flex items-center gap-2">
                                        {getDisplayText(value)}
                                        <Image
                                            src={getFlagPath(value)}
                                            alt={`${value} flag`}
                                            className="w-4 h-4 object-contain"
                                            width={16}
                                            height={16}
                                        />
                                    </span>
                                </button>
                            )
                        }
                        return null
                    })}
                </div>
            )}
        </div>
    )
}
