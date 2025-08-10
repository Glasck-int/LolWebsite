'use client'

import { useEffect, useRef } from 'react'
import { useQueryString } from '@/lib/hooks/createQueryState'
import { useTableEntityStore } from '@/store/tableEntityStore'

/**
 * Hook for synchronizing tab state with URL query parameters
 * Uses the createQueryState utility for clean URL management
 */
export const useTabUrlSync = () => {
    const [tabParam, setTabParam] = useQueryString('tab', '')
    const { 
        activeTabIndex, 
        setActiveTab, 
        getTabName, 
        getTabIndex,
        tabConfigs 
    } = useTableEntityStore()
    
    const isInternalUpdateRef = useRef(false)
    const lastSyncedTabRef = useRef<string>('')

    // Sync from URL to store when tab param changes
    useEffect(() => {
        if (tabParam && tabConfigs.length > 0 && !isInternalUpdateRef.current) {
            const tabIndex = getTabIndex(tabParam)
            if (tabIndex !== activeTabIndex) {
                isInternalUpdateRef.current = true
                setActiveTab(tabIndex)
                lastSyncedTabRef.current = tabParam
                setTimeout(() => {
                    isInternalUpdateRef.current = false
                }, 0)
            }
        }
    }, [tabParam, tabConfigs.length, getTabIndex, setActiveTab, activeTabIndex])

    // Sync from store to URL when active tab changes
    useEffect(() => {
        if (tabConfigs.length > 0 && !isInternalUpdateRef.current) {
            const currentTabName = getTabName(activeTabIndex)
            if (currentTabName && currentTabName !== lastSyncedTabRef.current) {
                isInternalUpdateRef.current = true
                setTabParam(currentTabName)
                lastSyncedTabRef.current = currentTabName
                setTimeout(() => {
                    isInternalUpdateRef.current = false
                }, 0)
            }
        }
    }, [activeTabIndex, getTabName, setTabParam, tabConfigs.length])

    return {
        activeTabIndex,
        setActiveTab: (index: number) => {
            isInternalUpdateRef.current = true
            setActiveTab(index)
            const tabName = getTabName(index)
            if (tabName) {
                setTabParam(tabName)
                lastSyncedTabRef.current = tabName
            }
            setTimeout(() => {
                isInternalUpdateRef.current = false
            }, 0)
        }
    }
}