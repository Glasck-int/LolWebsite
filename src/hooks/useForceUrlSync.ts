'use client'

import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTableEntityStore } from '@/store/tableEntityStore'

/**
 * Hook to force immediate URL synchronization on user interactions
 */
export const useForceUrlSync = () => {
    const router = useRouter()
    const pathname = usePathname()
    const store = useTableEntityStore()
    
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
            return `${newPath}/${store.activeHeaderSeason}`
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

    // Force immediate URL synchronization
    const forceSync = useCallback(() => {
        const newUrl = buildUrl()
        if (newUrl !== pathname) {
            console.log('🚀 [FORCE SYNC] Immediately syncing URL:', { from: pathname, to: newUrl })
            router.replace(newUrl, { scroll: false })
        }
    }, [pathname, router, store.activeHeaderSeason, store.activeSplit, store.activeTournament, store.activeAllSeason, store.activeAllSplit])

    return { forceSync }
}