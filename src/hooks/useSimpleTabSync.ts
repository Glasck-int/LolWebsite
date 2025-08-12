'use client'

import { useEffect, useRef } from 'react'
import { useQueryString } from '@/lib/hooks/createQueryState'
import { useTableEntityStore } from '@/store/tableEntityStore'

/**
 * Simplified hook for tab URL synchronization
 * Only syncs on initial mount and when user clicks tabs
 */
export const useSimpleTabSync = () => {
    const [tabParam, setTabParam] = useQueryString('tab', '')
    const { 
        activeTabIndex, 
        setActiveTab: storeSetActiveTab, 
        getTabName, 
        getTabIndex,
        tabConfigs 
    } = useTableEntityStore()
    
    const hasInitializedRef = useRef(false)

    // Only sync from URL on initial mount
    useEffect(() => {
        if (!hasInitializedRef.current && tabParam && tabConfigs.length > 0) {
            hasInitializedRef.current = true
            const tabIndex = getTabIndex(tabParam)
            if (tabIndex >= 0) {
                storeSetActiveTab(tabIndex)
            }
        }
    }, [tabParam, tabConfigs.length, getTabIndex, storeSetActiveTab])

    // Provide a method that updates both store and URL
    const setActiveTab = (index: number) => {
        storeSetActiveTab(index)
        const tabName = getTabName(index)
        if (tabName) {
            setTabParam(tabName)
        }
    }

    return {
        activeTabIndex,
        setActiveTab
    }
}