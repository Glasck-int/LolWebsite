'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTableEntityStore } from '@/store/tableEntityStore'

export const useUrlSync = (isInitializing = false) => {
    const router = useRouter()
    const pathname = usePathname()
    const store = useTableEntityStore()
    
    // Track if we're ready to sync (after initial load)
    const readyToSyncRef = useRef(false)
    const lastNavigatedUrl = useRef<string>('')
    const isInitializingRef = useRef(true)
    const lastStoreStateRef = useRef<string>('')
    
    // Shorter wait time for better UX, and better initialization tracking
    useEffect(() => {
        const timer = setTimeout(() => {
            readyToSyncRef.current = true
            isInitializingRef.current = false
        }, 300) // Further reduced to 300ms for even better responsiveness
        
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

    // Debounced URL update to prevent excessive navigation calls
    const updateUrl = useCallback((newUrl: string) => {
        if (newUrl !== pathname && newUrl !== lastNavigatedUrl.current) {
            lastNavigatedUrl.current = newUrl
            // Use a more robust navigation approach
            const urlToNavigate = newUrl || pathname
            router.replace(urlToNavigate, { scroll: false })
            
            // Force a re-render to ensure URL is properly updated
            setTimeout(() => {
                if (window.location.pathname !== urlToNavigate) {
                    console.warn('URL sync mismatch, forcing update:', { expected: urlToNavigate, actual: window.location.pathname })
                    window.history.replaceState(null, '', urlToNavigate)
                }
            }, 100)
        }
    }, [pathname, router])

    // Force URL sync with more aggressive approach
    useEffect(() => {
        if (!readyToSyncRef.current || isInitializingRef.current || isInitializing) return
        
        const newUrl = buildUrl()
        
        // Create a hash of the current store state to detect actual changes
        const currentStoreState = `${store.activeHeaderSeason}-${store.activeSplit}-${store.activeTournament}-${store.activeAllSeason}-${store.activeAllSplit}`
        
        // Only update if store state actually changed
        if (currentStoreState !== lastStoreStateRef.current) {
            lastStoreStateRef.current = currentStoreState
            
            // Use immediate update for critical navigation changes
            const isSeasonChange = store.activeHeaderSeason !== pathname.split('/')[3]
            
            if (isSeasonChange) {
                // For season changes, update immediately to prevent stale URLs
                updateUrl(newUrl)
            } else {
                // For other changes, use a small delay to batch updates
                const timeoutId = setTimeout(() => {
                    updateUrl(newUrl)
                }, 25) // Reduced delay for faster response
                
                return () => clearTimeout(timeoutId)
            }
        }
        
    }, [
        store.activeHeaderSeason,
        store.activeSplit,
        store.activeTournament,
        store.activeAllSeason,
        store.activeAllSplit,
        updateUrl,
        pathname // Add pathname to detect URL changes
    ])
}