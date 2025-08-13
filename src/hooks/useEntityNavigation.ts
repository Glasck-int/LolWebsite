'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTableEntityStore, SeasonData, Tournament } from '@/store/tableEntityStore'

export const useEntityNavigation = () => {
    const router = useRouter()
    const pathname = usePathname()
    const { 
        activeHeaderSeason, 
        activeSplit, 
        selectSeason,
        selectSplit,
        selectTournament
    } = useTableEntityStore()

    // Extract entity name from current path
    const getEntityInfo = () => {
        const segments = pathname.split('/').filter(Boolean)
        
        // Handle locale prefix: /fr/teams/... or /teams/...
        const hasLocale = segments.length >= 2 && segments[0].length === 2
        const startIndex = hasLocale ? 1 : 0
        
        if (segments.length < startIndex + 2) return null
        
        const entityType = segments[startIndex] // 'teams', 'players', or 'leagues'
        const entityName = segments[startIndex + 1] // The name from the URL
        
        return { entityType, entityName }
    }

    // Navigate to new URL format with segments
    const navigateToEntity = (season?: string, split?: string, tournament?: string) => {
        const entityInfo = getEntityInfo()
        if (!entityInfo) return

        const { entityType, entityName } = entityInfo
        
        // Build the new URL with segments
        let newPath = `/${entityType}/${entityName}`
        
        if (season) {
            newPath += `/${season}`
            if (split) {
                newPath += `/${split}`
                if (tournament) {
                    newPath += `/${tournament}`
                }
            }
        }

        // Preserve the locale prefix if it exists
        const localeMatch = pathname.match(/^\/([a-z]{2})\//)
        if (localeMatch) {
            newPath = `/${localeMatch[1]}${newPath}`
        }

        router.push(newPath)
    }

    // Wrapper functions that update store AND navigate
    const navigateToSeason = (season: string, seasonsData: SeasonData[], isAllActive: boolean) => {
        selectSeason(season, seasonsData, isAllActive)
        navigateToEntity(season === 'all' ? undefined : season)
    }

    const navigateToSplit = (split: string, seasonsData: SeasonData[], isAllActive: boolean) => {
        selectSplit(split, seasonsData, isAllActive)
        navigateToEntity(activeHeaderSeason, split === 'all' ? undefined : split)
    }

    const navigateToTournament = (tournament: Tournament) => {
        selectTournament(tournament)
        navigateToEntity(activeHeaderSeason, activeSplit, tournament.tournament)
    }

    return {
        navigateToSeason,
        navigateToSplit,
        navigateToTournament
    }
}