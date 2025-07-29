import { useState} from 'react'

/**
 * useSelectorState – Custom hook to manage active index state.
 *
 * This hook provides an interface to track and update an active index, typically
 * used for switching between tab-like components or selector UIs. It can optionally
 * take a default index, which is 0 by default.
 *
 * @function useSelectorState
 *
 * @param number [defaultSelector=0] - Optional. The default active index to initialize with.
 *
 * @returns Object An object containing the current index and a function to update it.
 * @returns number return.activeIndex - Current active index.
 * @returns Function return.setActiveIndex - Function to update the active index.
 *
 * @example
 * const { activeIndex, setActiveIndex } = useSelectorState()
 *
 * @example
 * const { activeIndex, setActiveIndex } = useSelectorState(2)
 */
export const useIndexState = (defaultSelector: number = 0) => {
    const [activeIndex, setActiveIndex] = useState(defaultSelector)

    return {
        activeIndex,
        setActiveIndex,
    }
}