'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTableEntityStore } from '@/store/tableEntityStore'

export const useUrlSync = () => {
    const router = useRouter()
    const pathname = usePathname()
    const store = useTableEntityStore()
    
    // Track if we're ready to sync (after initial load)
    const readyToSyncRef = useRef(false)
    const lastNavigatedUrl = useRef<string>('')
    
    // Wait a bit after mount to avoid interfering with initialization
    useEffect(() => {
        const timer = setTimeout(() => {
            readyToSyncRef.current = true
        }, 2000) // Wait 2 seconds for initial load to complete
        
        return () => clearTimeout(timer)
    }, [])

    // Extract entity info from current pathname
    const getEntityInfo = () => {
        const segments = pathname.split('/').filter(Boolean)
        const hasLocale = segments.length >= 2 && segments[0].length === 2
        const startIndex = hasLocale ? 1 : 0
        
        if (segments.length < startIndex + 2) return null
        
        const entityType = segments[startIndex] // 'teams', 'players', 'leagues'
        const entityName = segments[startIndex + 1] // The name
        const localePrefix = hasLocale ? `/${segments[0]}` : ''
        
        return { entityType, entityName, localePrefix }
    }

    // Build URL with current selections
    const buildUrl = () => {
        const entityInfo = getEntityInfo()
        if (!entityInfo) return pathname
        
        const { entityType, entityName, localePrefix } = entityInfo
        let newPath = `${localePrefix}/${entityType}/${entityName}`
        
        // Add segments based on store state
        if (store.activeAllSeason) {
            // All seasons selected - just base URL
            return newPath
        }
        
        if (store.activeAllSplit && store.activeHeaderSeason) {
            // All splits of a season
            return `${newPath}/${store.activeHeaderSeason}`
        }
        
        // Normal selection
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

    // Sync URL when store changes (but only after initial load)
    useEffect(() => {
        if (!readyToSyncRef.current) return
        
        const newUrl = buildUrl()
        
        // Only navigate if URL actually changed and it's different from last navigation
        if (newUrl !== pathname && newUrl !== lastNavigatedUrl.current) {
            lastNavigatedUrl.current = newUrl
            router.replace(newUrl) // Use replace to avoid adding to history
        }
        
    }, [
        store.activeHeaderSeason,
        store.activeSplit,
        store.activeTournament,
        store.activeAllSeason,
        store.activeAllSplit,
        pathname,
        router
    ])
}