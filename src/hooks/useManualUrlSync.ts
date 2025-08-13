'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTableEntityStore } from '@/store/tableEntityStore'
import { useInitializationStatus } from './useInitializationStatus'

export const useManualUrlSync = () => {
    const router = useRouter()
    const pathname = usePathname()
    const store = useTableEntityStore()
    const { isInitialized } = useInitializationStatus()

    // Extract entity info from current pathname
    const getEntityInfo = () => {
        const segments = pathname.split('/').filter(Boolean)
        const hasLocale = segments.length >= 2 && segments[0].length === 2
        const startIndex = hasLocale ? 1 : 0
        
        if (segments.length < startIndex + 2) return null
        
        const entityType = segments[startIndex]
        const entityName = segments[startIndex + 1]
        const localePrefix = hasLocale ? `/${segments[0]}` : ''
        
        return { entityType, entityName, localePrefix }
    }

    // Build URL with current selections
    const buildUrl = () => {
        const entityInfo = getEntityInfo()
        if (!entityInfo) return pathname
        
        const { entityType, entityName, localePrefix } = entityInfo
        let newPath = `${localePrefix}/${entityType}/${entityName}`
        
        if (store.activeAllSeason) {
            return newPath
        }
        
        if (store.activeAllSplit && store.activeHeaderSeason) {
            return `${newPath}/${encodeURIComponent(store.activeHeaderSeason)}`
        }
        
        if (store.activeHeaderSeason) {
            newPath += `/${encodeURIComponent(store.activeHeaderSeason)}`
            
            if (store.activeSplit) {
                newPath += `/${encodeURIComponent(store.activeSplit)}`
                
                if (store.activeTournament) {
                    newPath += `/${encodeURIComponent(store.activeTournament)}`
                }
            }
        }
        
        return newPath
    }

    // Method to manually sync URL (to be called by components when they're sure about the change)
    const syncUrl = () => {
        console.log('🌐 syncUrl called, isInitialized:', isInitialized)
        if (!isInitialized) {
            console.log('❌ Not initialized, skipping sync')
            return
        }
        
        const newUrl = buildUrl()
        console.log('🔗 Current pathname:', pathname)
        console.log('🔗 New URL would be:', newUrl)
        
        if (newUrl !== pathname) {
            console.log('✅ URLs differ, navigating to:', newUrl)
            router.replace(newUrl)
        } else {
            console.log('⏭️ URLs are the same, no navigation needed')
        }
    }

    return { syncUrl }
}