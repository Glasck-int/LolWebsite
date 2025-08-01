import { useCallback, ReactElement, cloneElement, isValidElement, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTableEntityStore, SeasonData } from '@/store/tableEntityStore'

interface CardFooterProps {
    children: ReactNode
}

interface PElementProps {
    children: string
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
}

interface CardFooterContentProps {
    children: ReactElement<PElementProps>
    className?: string
    style?: React.CSSProperties
}

/**
 * Hook for automatic tab detection and management
 * Automatically detects tabs from JSX structure and handles URL synchronization
 */
export const useAutoTabs = () => {
    const searchParams = useSearchParams()
    const { 
        registerTab, 
        setActiveTab, 
        getActiveTabIndex, 
        syncFromUrl 
    } = useTableEntityStore()

    /**
     * Extracts tab names from CardFooterContent elements
     * @param cardFooter - The CardFooter JSX element
     * @returns Array of tab display names
     */
    const extractTabNames = useCallback((cardFooter: ReactElement<CardFooterProps>): string[] => {
        const tabNames: string[] = []
        
        if (cardFooter && cardFooter.props.children) {
            const children = Array.isArray(cardFooter.props.children) 
                ? cardFooter.props.children 
                : [cardFooter.props.children]
            
            children.forEach((child: ReactNode) => {
                if (isValidElement<CardFooterContentProps>(child) && child.props.children) {
                    // Look for <p> element inside CardFooterContent
                    const pElement = child.props.children
                    
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
    const injectTabHandlers = useCallback((cardFooter: ReactElement<CardFooterProps>): ReactElement<CardFooterProps> => {
        if (!cardFooter || !cardFooter.props.children) return cardFooter
        
        const children = Array.isArray(cardFooter.props.children) 
            ? cardFooter.props.children 
            : [cardFooter.props.children]
        
        const enhancedChildren = children.map((child: ReactNode, index: number) => {
            if (isValidElement<CardFooterContentProps>(child)) {
                // Clone the CardFooterContent and add onClick to the <p> element
                const pElement = child.props.children
                const enhancedPElement = cloneElement(pElement, {
                    ...pElement.props,
                    onClick: () => setActiveTab(index),
                    className: `${pElement.props.className || ''} cursor-pointer hover:text-white`,
                    style: { 
                        ...pElement.props.style,
                        transition: 'color 0.2s ease'
                    }
                })
                
                const enhancedChild = cloneElement(child, {
                    ...child.props,
                    children: enhancedPElement
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
        cardFooterElement: ReactElement<CardFooterProps>, 
        seasons?: SeasonData[]
    ) => {
        // Extract tab names from the JSX structure
        const tabNames = extractTabNames(cardFooterElement)
        
        if (tabNames.length > 0) {
            // Register tabs in the store
            tabNames.forEach((displayName, index) => {
                registerTab(index, displayName)
            })
            
            // Sync from URL if seasons are available
            if (seasons && seasons.length > 0) {
                syncFromUrl(searchParams, seasons)
            }
        }
    }, [extractTabNames, registerTab, syncFromUrl, searchParams])

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