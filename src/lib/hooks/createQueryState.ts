import { useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState, useEffect, useRef } from 'react'

type QueryStateType = 'string' | 'number' | 'boolean' | 'date'

/**
 * Parses a query string value into a typed value.
 *
 * Converts a query string value into a typed value (`string`, `number`, `boolean`, or `Date`) based on the specified type.
 *
 * @param value - The raw query string value to parse (can be `null`)
 * @param type - The expected type to convert the value into
 * @param defaultValue - A fallback value to use if parsing fails or the input is `null`
 * @returns The parsed value as the specified type, or the default value
 *
 * @example
 * ```ts
 * const result = parseQueryValue("true", "boolean", false);
 * console.log(result); // true
 * ```
 *
 * @remarks
 * This function is used internally by `useQueryState` to convert URL query parameters into usable state values.
 */
const parseQueryValue = <T>(value: string | null, type: QueryStateType, defaultValue: T): T => {
    if (value === null) return defaultValue
    
    switch (type) {
        case 'string':
            return value as T
        case 'number':
            const num = parseFloat(value)
            return (isNaN(num) ? defaultValue : num) as T
        case 'boolean':
            return (value === 'true') as T
        case 'date':
            const date = new Date(value)
            return (isNaN(date.getTime()) ? defaultValue : date) as T
        default:
            return defaultValue
    }
}

/**
 * Serializes a typed value into a string suitable for use in a URL query parameter.
 *
 * Converts a value of type `string`, `number`, `boolean`, or `Date` into a string representation.
 *
 * @param value - The value to serialize
 * @param type - The type of the value, used to determine how to serialize it
 * @returns A string suitable for a query parameter, or `null` if the value is empty or invalid
 *
 * @example
 * ```ts
 * const result = serializeQueryValue(new Date('2024-01-01'), 'date');
 * console.log(result); // 'Mon Jan 01 2024'
 * ```
 *
 * @remarks
 * This function is used to update the URL state when calling `setValue` in `useQueryState`.
 *
 * @see parseQueryValue
 */
const serializeQueryValue = <T>(value: T, type: QueryStateType): string | null => {
    if (value === null || value === undefined) return null
    
    switch (type) {
        case 'string':
            return value as string || null
        case 'number':
            return value.toString()
        case 'boolean':
            return value ? 'true' : null
        case 'date':
            return (value as unknown as Date).toDateString()
        default:
            return value.toString()
    }
}

/**
 * Compares two values for equality, with special handling for `Date` instances.
 *
 * Determines whether two values are equal. For `Date` objects, compares their timestamps.
 *
 * @param a - The first value to compare
 * @param b - The second value to compare
 * @returns `true` if the values are equal, `false` otherwise
 *
 * @example
 * ```ts
 * const result = isEqual(new Date('2024-01-01'), new Date('2024-01-01'));
 * console.log(result); // true
 * ```
 *
 * @remarks
 * Used by `useQueryState` to determine whether to update internal state when query parameters change.
 */
const isEqual = <T>(a: T, b: T): boolean => {
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
    }
    return a === b
}

/**
 * Syncs a typed state value with the URL query parameter.
 *
 * Creates a React state hook that persists its value in the URL using query parameters, supporting types like `string`, `number`, `boolean`, and `Date`.
 *
 * @param queryKey - The name of the query parameter in the URL
 * @param defaultValue - The default value to use if the query parameter is not present or invalid
 * @param type - The expected type of the query parameter (`'string' | 'number' | 'boolean' | 'date'`)
 * @returns A tuple containing the current value and a setter function to update both the state and the URL
 *
 * @example
 * ```ts
 * const [page, setPage] = useQueryState<number>('page', 1, 'number');
 * setPage(2); // URL becomes ?page=2
 * ```
 *
 * @remarks
 * This hook listens to changes in the URL and keeps the internal state synchronized.
 * Setting a new value will update the query string without triggering a full page reload.
 * Useful for preserving UI state (filters, pagination, tabs) across page reloads or sharing.
 *
 * @see useQueryString, useQueryNumber, useQueryBoolean, useQueryDate
 */
export function useQueryState<T>(
    queryKey: string,
    defaultValue: T,
    type: QueryStateType
): [T, (value: T) => void] {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const isUpdatingRef = useRef(false)
    
    const [state, setState] = useState<T>(() => {
        const queryValue = searchParams.get(queryKey)
        return parseQueryValue(queryValue, type, defaultValue)
    })
    
    useEffect(() => {
        if (isUpdatingRef.current) {
            isUpdatingRef.current = false
            return
        }
        
        const queryValue = searchParams.get(queryKey)
        const parsedValue = parseQueryValue(queryValue, type, defaultValue)
        
        setState(prevState => {
            if (!isEqual(prevState, parsedValue)) {
                return parsedValue
            }
            return prevState
        })
    }, [searchParams,])
    
    const updateURL = useCallback(
        (newValue: T) => {
            const current = new URLSearchParams(searchParams.toString())
            const serializedValue = serializeQueryValue(newValue, type)
            
            if (serializedValue === null || serializedValue === '') {
                current.delete(queryKey)
            } else {
                current.set(queryKey, serializedValue)
            }
            
            const newSearch = current.toString()
            const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname
            
            if (typeof window !== 'undefined') {
                isUpdatingRef.current = true
                window.history.replaceState(null, '', newUrl)
            }
        },
        [searchParams, pathname, queryKey, type]
    )
    
    const setValue = useCallback(
        (newValue: T) => {
            setState(newValue)
            updateURL(newValue)
        },
        [updateURL]
    )
    
    return [state, setValue]
}

/**
 * React hook for syncing a string state value with a URL query parameter.
 *
 * @param queryKey - The name of the query parameter
 * @param defaultValue - Default string value if the parameter is missing (defaults to '')
 * @returns A tuple containing the current string value and a setter
 *
 * @example
 * ```ts
 * const [search, setSearch] = useQueryString('search');
 * setSearch('apple'); // URL becomes ?search=apple
 * ```
 *
 * @see useQueryState
 */
export const useQueryString = (queryKey: string, defaultValue: string = '') =>
    useQueryState(queryKey, defaultValue, 'string')

/**
 * React hook for syncing a number state value with a URL query parameter.
 *
 * @param queryKey - The name of the query parameter
 * @param defaultValue - Default number value if the parameter is missing or invalid (defaults to 0)
 * @returns A tuple containing the current number value and a setter
 *
 * @example
 * ```ts
 * const [page, setPage] = useQueryNumber('page', 1);
 * setPage(2); // URL becomes ?page=2
 * ```
 *
 * @see useQueryState
 */
export const useQueryNumber = (queryKey: string, defaultValue: number = 0) =>
    useQueryState(queryKey, defaultValue, 'number')

/**
 * React hook for syncing a boolean state value with a URL query parameter.
 *
 * @param queryKey - The name of the query parameter
 * @param defaultValue - Default boolean value if the parameter is missing (defaults to false)
 * @returns A tuple containing the current boolean value and a setter
 *
 * @example
 * ```ts
 * const [isOpen, setIsOpen] = useQueryBoolean('open', false);
 * setIsOpen(true); // URL becomes ?open=true
 * ```
 *
 * @see useQueryState
 */
export const useQueryBoolean = (queryKey: string, defaultValue: boolean = false) =>
    useQueryState(queryKey, defaultValue, 'boolean')

/**
 * React hook for syncing a Date object with a URL query parameter.
 *
 * @param queryKey - The name of the query parameter
 * @param defaultValue - Default Date value if the parameter is missing or invalid (defaults to current date)
 * @returns A tuple containing the current Date value and a setter
 *
 * @example
 * ```ts
 * const [selectedDate, setSelectedDate] = useQueryDate('date');
 * setSelectedDate(new Date('2023-01-01')); // URL becomes ?date=Sun Jan 01 2023
 * ```
 *
 * @remarks
 * The date is serialized using `.toDateString()`, so time information is discarded.
 *
 * @see useQueryState
 */
export const useQueryDate = (queryKey: string, defaultValue: Date = new Date()) =>
    useQueryState(queryKey, defaultValue, 'date')