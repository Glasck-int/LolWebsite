import { useEffect, RefObject } from 'react'

/**
 * Custom hook to handle clicks outside of a specified element
 *
 * Detects when a user clicks outside of a referenced element and triggers a callback function.
 * Useful for closing dropdowns, modals, or other UI components when clicking outside their boundaries.
 *
 * @param ref - React ref object pointing to the element to monitor
 * @param callback - Function to execute when a click outside is detected
 * @returns void
 *
 * @example
 * ```ts
 * const dropdownRef = useRef<HTMLDivElement>(null);
 *
 * useClickOutside(dropdownRef, () => {
 *   setIsOpen(false);
 * });
 * ```
 *
 * @remarks
 * The hook automatically adds and removes event listeners to prevent memory leaks.
 * It uses mousedown event instead of click for better responsiveness.
 * The callback is only triggered if the click target is not contained within the referenced element.
 *
 * @see LocaleSwitcherSelect - Component that uses this hook for dropdown behavior
 * @see DropdownMenu - Component that implements similar click outside functionality
 */
export const useClickOutside = (
    ref: RefObject<HTMLElement | null>,
    callback: () => void
): void => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setTimeout(() => {
                    callback()
                }, 150)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [ref, callback])
}
