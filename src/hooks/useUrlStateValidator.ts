'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTableEntityStore } from '@/store/tableEntityStore'

/**
 * Hook to validate and correct URL state inconsistencies
 * Ensures URL always reflects the actual store state
 */
export const useUrlStateValidator = () => {
    const router = useRouter()
    const pathname = usePathname()
    const store = useTableEntityStore()
    const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pageLoadTimeRef = useRef<number>(Date.now())
    const lastPathnameRef = useRef<string>(pathname)
    
    // Reset page load time when pathname changes (new navigation)
    useEffect(() => {
        if (lastPathnameRef.current !== pathname) {
            pageLoadTimeRef.current = Date.now()
            lastPathnameRef.current = pathname
            console.log('🔄 [URL VALIDATOR] New page navigation detected, resetting timer')
        }
    }, [pathname])
    
    // Extract entity info from current pathname
    const getEntityInfo = () => {
        const segments = pathname.split('/').filter(Boolean)
        const hasLocale = segments.length >= 2 && segments[0].length === 2
        const startIndex = hasLocale ? 1 : 0
        
        if (segments.length < startIndex + 2) return null
        
        const entityType = segments[startIndex] // 'teams', 'players', 'leagues'
        const entityName = segments[startIndex + 1] // The name
        const localePrefix = hasLocale ? `/${segments[0]}` : ''
        
        return { entityType, entityName, localePrefix, segments }
    }

    // Build expected URL from store state
    const buildExpectedUrl = () => {
        const entityInfo = getEntityInfo()
        if (!entityInfo) return pathname
        
        const { entityType, entityName, localePrefix } = entityInfo
        let expectedPath = `${localePrefix}/${entityType}/${entityName}`
        
        // Add segments based on store state
        if (store.activeAllSeason) {
            return expectedPath // All seasons selected - just base URL
        }
        
        if (store.activeAllSplit && store.activeHeaderSeason) {
            return `${expectedPath}/${store.activeHeaderSeason}` // All splits of a season
        }
        
        // Normal selection
        if (store.activeHeaderSeason) {
            expectedPath += `/${encodeURIComponent(store.activeHeaderSeason)}`
            
            if (store.activeSplit) {
                expectedPath += `/${encodeURIComponent(store.activeSplit)}`
                
                if (store.activeTournament) {
                    expectedPath += `/${encodeURIComponent(store.activeTournament)}`
                }
            }
        }
        
        return expectedPath
    }

    // Validate and fix URL if needed
    const validateUrlState = () => {
        const expectedUrl = buildExpectedUrl()
        
        // Check if we're on a base entity page (like /players/HARPOON/) without tournament info
        const segments = pathname.split('/').filter(Boolean)
        const hasLocale = segments.length >= 2 && segments[0].length === 2
        const startIndex = hasLocale ? 1 : 0
        const isBaseEntityPage = segments.length === startIndex + 2 // Just /locale/entityType/entityName
        
        if (expectedUrl !== pathname) {
            // Check how much time has passed since page load
            const timeSincePageLoad = Date.now() - pageLoadTimeRef.current
            
            console.warn('🔧 [URL VALIDATOR] URL state mismatch detected:', {
                current: pathname,
                expected: expectedUrl,
                isBaseEntityPage,
                timeSincePageLoad,
                store: {
                    season: store.activeHeaderSeason,
                    split: store.activeSplit,
                    tournament: store.activeTournament,
                    allSeason: store.activeAllSeason,
                    allSplit: store.activeAllSplit
                }
            })
            
            // Skip validation on base entity pages if not enough time has passed
            // This prevents automatic validation on page load but allows manual selections after 2 seconds
            if (isBaseEntityPage && timeSincePageLoad < 2000) {
                console.log('🚫 [URL VALIDATOR] Skipping URL validation for base entity page (too soon after page load)')
                return
            }
            
            // Fix the URL
            router.replace(expectedUrl, { scroll: false })
        }
    }

    // Run validation periodically and on store changes
    useEffect(() => {
        // Clear any existing validation
        if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current)
        }
        
        // Schedule validation
        validationTimeoutRef.current = setTimeout(() => {
            validateUrlState()
        }, 1000) // Validate 1 second after changes to allow settling
        
        return () => {
            if (validationTimeoutRef.current) {
                clearTimeout(validationTimeoutRef.current)
            }
        }
    }, [
        store.activeHeaderSeason,
        store.activeSplit,
        store.activeTournament,
        store.activeAllSeason,
        store.activeAllSplit,
        pathname
    ])
}