'use client'

import { TextSearch, Search, X } from 'lucide-react'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { useState, useRef, useEffect, useCallback } from 'react'

interface FunctionalSearchBarProps {
    onSearch: (searchTerm: string) => void
    placeholder?: string
    className?: string
    debounceMs?: number
    searchLogo?: string
}

/**
 * Functional search bar component
 *
 * A responsive search bar component that provides real search functionality.
 * Always visible and functional without modal overlay.
 *
 * @param onSearch - Callback function called when search term changes
 * @param placeholder - Custom placeholder text for the search input
 * @param className - Additional CSS classes
 * @param debounceMs - Debounce delay in milliseconds (default: 150ms)
 * @returns A functional search bar component
 *
 * @example
 * ```ts
 * const handleSearch = (term: string) => {
 *   console.log('Searching for:', term);
 * };
 *
 * <FunctionalSearchBar onSearch={handleSearch} />
 * ```
 *
 * @remarks
 * The component uses debouncing to avoid excessive API calls during typing.
 * Always displays a full search bar that's immediately functional.
 */
export const FunctionalSearchBar = ({
    onSearch,
    placeholder,
    className = '',
    debounceMs = 150,
    searchLogo = 'loop',
}: FunctionalSearchBarProps) => {
    const translate = useTranslate('SearchBar')
    const [searchTerm, setSearchTerm] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const selectSearchLogo = () => {
        const logoClass = 'w-5 h-5 text-gray-400 flex-shrink-0'

        switch (searchLogo) {
            case 'loop':
                return <Search className={logoClass} />
            case 'textSearch':
                return <TextSearch className={logoClass} />
            default:
                return <Search className={logoClass} />
        }
    }

    // Optimisation : useCallback pour éviter les re-renders inutiles
    const debouncedSearch = useCallback(
        (term: string) => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }

            debounceTimeoutRef.current = setTimeout(() => {
                onSearch(term)
            }, debounceMs)
        },
        [onSearch, debounceMs]
    )

    // Debounced search effect optimisé
    useEffect(() => {
        debouncedSearch(searchTerm)

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [searchTerm, debouncedSearch])

    // Handle clear search optimisé
    const handleClearSearch = useCallback(() => {
        setSearchTerm('')
        onSearch('') // Recherche immédiate sans debounce
        searchInputRef.current?.focus()
    }, [onSearch])

    // Handle input change optimisé
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            setSearchTerm(value)
        },
        []
    )

    const defaultPlaceholder = translate('Title')

    return (
        <div
            className={`box-border h-12 w-full bg-white/10 backdrop-blur flex items-center rounded-3xl gap-3 px-4 transition-all duration-200 justify-between ${
                isFocused
                    ? 'bg-white/20 ring-2 ring-white/30'
                    : 'hover:bg-white/20'
            } ${className}`}
        >
            {selectSearchLogo()}
            <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder={placeholder || defaultPlaceholder}
                className=" flex-1 text-white placeholder-grey focus:outline-none text-base min-w-0"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {searchTerm && (
                <X
                    className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors duration-200"
                    onClick={handleClearSearch}
                />
            )}
        </div>
    )
}
