/**
 * @fileoverview Smart tabs system for automatic tab detection
 * 
 * This module provides a smart tab system that automatically:
 * - Detects tabs from JSX structure without manual configuration
 * - Handles click events and tab switching
 * 
 * @example
 * ```tsx
 * // Basic usage - tabs are automatically detected
 * <SmartCardFooter>
 *   <SmartCardFooterContent>
 *     <p className="text-inherit">Aperçu</p>
 *   </SmartCardFooterContent>
 *   <SmartCardFooterContent>
 *     <p className="text-inherit">Matchs</p>
 *   </SmartCardFooterContent>
 * </SmartCardFooter>
 * ```
 * 
 * @author joaquim
 * @version 1.0.0
 */

'use client'

import React, { useEffect, useRef, ReactNode } from 'react'
import { useTableEntityStore } from '@/store/tableEntityStore'
import { 
    CardFooter as BaseCardFooter, 
    CardFooterContent as BaseCardFooterContent 
} from './card'

/**
 * Type definition for React elements with properly typed HTML attributes
 * @interface ElementWithProps
 * @extends React.ReactElement
 */
interface ElementWithProps extends React.ReactElement {
    props: React.HTMLAttributes<HTMLElement> & {
        children?: ReactNode
        className?: string
        style?: React.CSSProperties
    }
}

/**
 * Props for the SmartCardFooter component
 * @interface SmartCardFooterProps
 */
interface SmartCardFooterProps {
    /** Child elements - should be SmartCardFooterContent components */
    children: ReactNode
    /** Optional CSS classes for styling */
    className?: string
}

/**
 * Smart CardFooter component that automatically detects and registers tabs
 * 
 * This component:
 * - Automatically extracts tab names from child SmartCardFooterContent elements
 * - Registers tabs with the Zustand store
 * - Injects tabIndex props into child components
 * - Prevents duplicate registrations using a ref guard
 * 
 * @param props - Component props
 * @param props.children - SmartCardFooterContent elements containing tab content
 * @param props.className - Optional CSS classes for the footer container
 * @returns JSX element wrapping the tab footer with automatic registration
 * 
 * @example
 * ```tsx
 * <SmartCardFooter>
 *   <SmartCardFooterContent>
 *     <p>Overview</p>
 *   </SmartCardFooterContent>
 *   <SmartCardFooterContent>
 *     <p>Matches</p>
 *   </SmartCardFooterContent>
 * </SmartCardFooter>
 * ```
 */
export const SmartCardFooter = ({ children, className }: SmartCardFooterProps) => {
    const { registerTab } = useTableEntityStore()
    const registeredRef = useRef(false)

    useEffect(() => {
        // Only register once to prevent duplicate registrations
        if (!registeredRef.current) {
            registeredRef.current = true
            
            // Extract tab names from children structure
            const childrenArray = React.Children.toArray(children)
            childrenArray.forEach((child, index) => {
                if (React.isValidElement(child)) {
                    const childProps = child.props as { children?: ReactNode }
                    if (childProps.children && React.isValidElement(childProps.children)) {
                        const pElement = childProps.children as ElementWithProps
                        if (typeof pElement.props.children === 'string') {
                            registerTab(index, pElement.props.children)
                        }
                    }
                }
            })
        }
    }, [registerTab, children])

    return (
        <BaseCardFooter className={className}>
            {React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<SmartCardFooterContentProps>, { 
                        tabIndex: index 
                    })
                }
                return child
            })}
        </BaseCardFooter>
    )
}

/**
 * Props for the SmartCardFooterContent component
 * @interface SmartCardFooterContentProps
 */
interface SmartCardFooterContentProps {
    /** Child elements - typically a <p> tag with tab text */
    children: ReactNode
    /** Optional CSS classes for styling */
    className?: string
    /** Tab index injected automatically by SmartCardFooter */
    tabIndex?: number
}

/**
 * Smart CardFooterContent component that handles tab clicks and styling
 * 
 * This component:
 * - Automatically receives tabIndex from parent SmartCardFooter
 * - Injects click handlers into child elements
 * - Adds hover effects and cursor styling
 * - Connects to Zustand store for tab state management
 * 
 * @param props - Component props
 * @param props.children - Child elements (usually a <p> tag with tab text)
 * @param props.className - Optional CSS classes for the content container
 * @param props.tabIndex - Tab index (injected automatically by parent)
 * @returns JSX element with enhanced click handling and styling
 * 
 * @example
 * ```tsx
 * <SmartCardFooterContent>
 *   <p className="text-inherit">Aperçu</p>
 * </SmartCardFooterContent>
 * ```
 */
export const SmartCardFooterContent = ({ 
    children, 
    className, 
    tabIndex = 0 
}: SmartCardFooterContentProps) => {
    const { setActiveTab } = useTableEntityStore()

    /**
     * Handles tab click by updating the active tab in the store
     */
    const handleClick = () => {
        setActiveTab(tabIndex)
    }

    // Enhanced children with click handler and interactive styles
    const enhancedChildren = React.isValidElement(children) 
        ? React.cloneElement(children as ElementWithProps, {
            onClick: handleClick,
            className: `${(children as ElementWithProps).props.className || ''} cursor-pointer hover:text-white transition-colors duration-200`,
            style: {
                ...(children as ElementWithProps).props.style,
                userSelect: 'none'
            } as React.CSSProperties
        })
        : children

    return (
        <BaseCardFooterContent className={className}>
            {enhancedChildren}
        </BaseCardFooterContent>
    )
}