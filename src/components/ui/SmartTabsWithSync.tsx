/**
 * @fileoverview Smart tabs wrapper component with URL synchronization
 * This component wraps SmartCardFooter and SmartCardFooterContent to provide
 * automatic URL synchronization using the createQueryState hooks
 */

'use client'

import React, { ReactNode } from 'react'
import { useTabUrlSync } from '@/hooks/useTabUrlSync'
import { SmartCardFooter, SmartCardFooterContent } from './SmartTabs'

interface SmartTabsWithSyncProps {
    children: ReactNode
    className?: string
}

/**
 * Wrapper component that adds URL synchronization to SmartCardFooter
 * Automatically syncs the active tab with the 'tab' query parameter
 */
export const SmartTabsWithSync = ({ children, className }: SmartTabsWithSyncProps) => {
    // Initialize URL synchronization
    useTabUrlSync()
    
    return (
        <SmartCardFooter className={className}>
            {children}
        </SmartCardFooter>
    )
}

// Re-export SmartCardFooterContent for convenience
export { SmartCardFooterContent }