/**
 * @fileoverview Smart tabs components with URL synchronization
 * Uses the simplified tab sync hook to avoid infinite loops
 */

'use client'

import React, { ReactNode, useEffect, useRef } from 'react'
import { useSimpleTabSync } from '@/hooks/useSimpleTabSync'
import { useTableEntityStore } from '@/store/tableEntityStore'
import { 
    CardFooter as BaseCardFooter, 
    CardFooterContent as BaseCardFooterContent 
} from './card'

interface ElementWithProps extends React.ReactElement {
    props: React.HTMLAttributes<HTMLElement> & {
        children?: ReactNode
        className?: string
        style?: React.CSSProperties
    }
}

interface SmartCardFooterSyncProps {
    children: ReactNode
    className?: string
}

interface SmartCardFooterContentSyncProps {
    children: ReactNode
    className?: string
    tabIndex?: number
}

/**
 * SmartCardFooterSync - Footer with URL-synced tabs
 */
export const SmartCardFooterSync = ({ children, className }: SmartCardFooterSyncProps) => {
    const { registerTab } = useTableEntityStore()
    const registeredRef = useRef(false)

    useEffect(() => {
        // Register tabs once
        if (!registeredRef.current) {
            registeredRef.current = true
            
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
                    return React.cloneElement(child as React.ReactElement<SmartCardFooterContentSyncProps>, { 
                        tabIndex: index 
                    })
                }
                return child
            })}
        </BaseCardFooter>
    )
}

/**
 * SmartCardFooterContentSync - Tab content with URL sync on click
 */
export const SmartCardFooterContentSync = ({ 
    children, 
    className, 
    tabIndex = 0 
}: SmartCardFooterContentSyncProps) => {
    const { setActiveTab } = useSimpleTabSync()

    const handleClick = () => {
        setActiveTab(tabIndex)
    }

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