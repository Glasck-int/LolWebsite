import React from 'react'

import { Standings as StandingsType } from '../../../../../backend/src/generated/prisma'

import {
    getTeamsByNames,
    getTeamsRecentGames,
    getTeamsRecentMatches,
} from '@/lib/api/teams'
import { getTeamImage, getTeamImageByName } from '@/lib/api/image'
import { processStandingsData } from '../utils/StandingsDataProcessor'
import { Team } from '../../../../../backend/src/generated/prisma'
import { StandingsOverviewClient } from '../clients/StandingsOverviewClient'

/**
 * Standings overview component.
 *
 * Displays a complete standings table for a tournament with team statistics, recent form,
 * and team images. Fetches team data, recent matches, and images asynchronously.
 * Shows the top 3 teams by default on mobile, with all teams visible on desktop.
 *
 * @param standings - Array of raw standings data from the database
 * @param tournamentName - Name of the tournament for fetching recent matches
 * @param highlightedTeam - Optional team name to highlight in the standings
 * @param maxRows - Optional maximum number of rows to display (null for all rows)
 * @returns A complete standings table component with team data and statistics
 *
 * @example
 * ```tsx
 * const standings = await getStandings(tournamentId)
 *
 * <StandingsOverview
 *   standings={standings}
 *   tournamentName="LCS Spring 2024"
 *   highlightedTeam="Team Liquid"
 *   maxRows={5}
 * />
 * ```
 *
 * @remarks
 * This component performs several async operations:
 * - Fetches team data for all teams in standings
 * - Retrieves recent matches for form calculation
 * - Downloads team images for display
 * - Processes and enriches standings data
 */
export const StandingsOverview = async ({
    standings,
    tournamentName,
    highlightedTeam,
    maxRows,
}: {
    standings: StandingsType[]
    tournamentName: string
    highlightedTeam?: string
    maxRows?: number | null
}) => {
    const teamNames = standings
        .map((s) => s.team)
        .filter((name): name is string => !!name)

    const [teamsDataResponse, teamsRecentMatchesResponse, gamesRecentResponse] =
        await Promise.all([
            getTeamsByNames(teamNames),
            getTeamsRecentMatches(teamNames, tournamentName),
            getTeamsRecentGames(teamNames, tournamentName),
        ])

    const teamsData = teamsDataResponse.data || []
    const teamsRecentMatches = teamsRecentMatchesResponse.data || []

    const teamImagePromises = teamsData.map(async (team: Team) => {
        // Essayer d'abord avec l'image de l'équipe si elle existe
        let teamImageResponse = await getTeamImage(
            team.image?.replace('.png', '.webp') || ''
        )

        // console.log('teamImageResponse', teamImageResponse)
        // console.log('team.overviewPage', team.overviewPage)
        // Si ça ne marche pas, essayer avec le nom de l'équipe
        if (!teamImageResponse.data && team.overviewPage) {
            teamImageResponse = await getTeamImageByName(team.overviewPage)
        }

        return {
            teamName: team.overviewPage,
            imageUrl: teamImageResponse.data || '',
        }
    })

    const teamImageResults = await Promise.all(teamImagePromises)
    // console.log('teamImageResults', teamImageResults)
    const teamsImages: Record<string, string> = teamImageResults.reduce(
        (acc, result) => {
            if (result.teamName) {
                acc[result.teamName] = result.imageUrl
            }
            return acc
        },
        {} as Record<string, string>
    )

    const processedData = processStandingsData(
        standings,
        teamsData,
        teamsImages,
        teamsRecentMatches,
        gamesRecentResponse.data || []
    )

    return (
        <StandingsOverviewClient
            processedData={processedData}
            highlightedTeam={highlightedTeam}
            maxRows={maxRows}
        />
    )
}
