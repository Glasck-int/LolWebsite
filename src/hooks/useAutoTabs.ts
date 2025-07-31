import { useEffect, useCallback, ReactElement, cloneElement, isValidElement } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTableEntityStore } from '@/store/tableEntityStore'

/**
 * Hook for automatic tab detection and management
 * Automatically detects tabs from JSX structure and handles URL synchronization
 */
export const useAutoTabs = () => {
    const searchParams = useSearchParams()
    const { 
        autoRegisterTabs, 
        setActiveTab, 
        getActiveTabIndex, 
        syncFromUrl 
    } = useTableEntityStore()

    /**
     * Extracts tab names from CardFooterContent elements
     * @param cardFooter - The CardFooter JSX element
     * @returns Array of tab display names
     */
    const extractTabNames = useCallback((cardFooter: ReactElement): string[] => {
        const tabNames: string[] = []
        
        if (cardFooter && cardFooter.props.children) {
            const children = Array.isArray(cardFooter.props.children) 
                ? cardFooter.props.children 
                : [cardFooter.props.children]
            
            children.forEach((child: any) => {
                if (isValidElement(child) && child.props.children) {
                    // Look for <p> element inside CardFooterContent
                    const pElement = isValidElement(child.props.children) 
                        ? child.props.children 
                        : null
                    
                    if (pElement && typeof pElement.props.children === 'string') {
                        tabNames.push(pElement.props.children)
                    }
                }
            })
        }
        
        return tabNames
    }, [])

    /**
     * Injects onClick handlers into CardFooterContent elements
     * @param cardFooter - The CardFooter JSX element
     * @returns Enhanced CardFooter with click handlers
     */
    const injectTabHandlers = useCallback((cardFooter: ReactElement): ReactElement => {
        if (!cardFooter || !cardFooter.props.children) return cardFooter
        
        const children = Array.isArray(cardFooter.props.children) 
            ? cardFooter.props.children 
            : [cardFooter.props.children]
        
        const enhancedChildren = children.map((child: any, index: number) => {
            if (isValidElement(child)) {
                // Clone the CardFooterContent and add onClick to the <p> element
                const enhancedChild = cloneElement(child, {
                    ...child.props,
                    children: isValidElement(child.props.children) 
                        ? cloneElement(child.props.children, {
                            ...child.props.children.props,
                            onClick: () => setActiveTab(index),
                            className: `${child.props.children.props.className || ''} cursor-pointer hover:text-white`,
                            style: { 
                                ...child.props.children.props.style,
                                transition: 'color 0.2s ease'
                            }
                        })
                        : child.props.children
                })
                return enhancedChild
            }
            return child
        })
        
        return cloneElement(cardFooter, {
            ...cardFooter.props,
            children: enhancedChildren
        })
    }, [setActiveTab])

    /**
     * Auto-detects and registers tabs from JSX structure
     * @param cardFooterElement - The CardFooter JSX element containing tabs
     * @param seasons - Optional seasons data for URL sync
     */
    const registerTabsFromJSX = useCallback((
        cardFooterElement: ReactElement, 
        seasons?: any[]
    ) => {
        // Extract tab names from the JSX structure
        const tabNames = extractTabNames(cardFooterElement)
        
        if (tabNames.length > 0) {
            // Register tabs in the store
            autoRegisterTabs(tabNames)
            
            // Sync from URL if seasons are available
            if (seasons && seasons.length > 0) {
                syncFromUrl(searchParams, seasons)
            }
        }
    }, [extractTabNames, autoRegisterTabs, syncFromUrl, searchParams])

    return {
        /**
         * Registers tabs automatically from CardFooter JSX
         * Call this in useEffect with your CardFooter element
         */
        registerTabsFromJSX,
        
        /**
         * Enhances CardFooter with automatic click handlers
         * Use this to wrap your CardFooter JSX
         */
        injectTabHandlers,
        
        /**
         * Gets current active tab index
         */
        activeTabIndex: getActiveTabIndex(),
        
        /**
         * Manually set active tab (usually not needed with auto-detection)
         */
        setActiveTab
    }
}