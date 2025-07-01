'use client'

import { Search, X } from 'lucide-react'
import { useTranslate } from '@/lib/hooks/useTranslate'
import { useState, useRef, useEffect, useCallback } from 'react'

interface FunctionalSearchBarProps {
    onSearch: (searchTerm: string) => void
    placeholder?: string
    className?: string
    debounceMs?: number
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
export const FunctionalSearchBar: React.FC<FunctionalSearchBarProps> = ({
    onSearch,
    placeholder,
    className = '',
    debounceMs = 150,
}) => {
    const translate = useTranslate('SearchBar')
    const [searchTerm, setSearchTerm] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
        <div className={`relative w-full ${className}`}>
            {/* Search bar toujours visible */}
            <div className="relative w-full">
                <div
                    className={`h-12 bg-white/10 backdrop-blur flex items-center rounded-3xl gap-3 px-4 transition-all duration-200 ${
                        isFocused
                            ? 'bg-white/20 ring-2 ring-white/30'
                            : 'hover:bg-white/20'
                    }`}
                >
                    <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder={placeholder || defaultPlaceholder}
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-base"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                    {searchTerm && (
                        <X
                            className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors duration-200 flex-shrink-0"
                            onClick={handleClearSearch}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
