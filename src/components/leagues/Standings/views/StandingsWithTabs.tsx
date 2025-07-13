import React from 'react'
import { Standings as StandingsType } from '../../../../backend/src/generated/prisma'
import {
    getTeamsByNames,
    getTeamsRecentGames,
    getTeamsRecentMatches,
} from '@/lib/api/teams'
import { getTeamImage } from '@/lib/api/image'
import { getTournamentsGamesByTournamentOverviewPage } from '@/lib/api/tournaments'
import { processStandingsData } from '../utils/StandingsDataProcessor'
import { Team } from '../../../../backend/src/generated/prisma'
import { StandingsWithTabsClient } from '../clients/StandingsWithTabsClient'

/**
 * Standings component with tabs using CardBodyMultiple.
 *
 * Displays standings data in a card with multiple tabs, where the first tab
 * contains the complete standings table and the second tab shows games statistics.
 * Uses the same data processing as StandingsOverview but with CardBodyMultiple structure.
 *
 * @param standings - Array of raw standings data from the database
 * @param tournamentName - Name of the tournament for fetching recent matches and games
 * @param highlightedTeam - Optional team name to highlight in the standings
 * @param maxRows - Optional maximum number of rows to display (null for all rows)
 * @returns A standings component with tabs structure and complete standings in first tab
 *
 * @example
 * ```tsx
 * const standings = await getStandings(tournamentId)
 *
 * <StandingsWithTabs
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
 * - Fetches games data for the second tab
 * - Processes and enriches standings and games data
 *
 * The component uses CardBodyMultiple to allow for tab switching between standings and games.
 */
export const StandingsWithTabs = async ({
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

    const [
        teamsDataResponse,
        teamsRecentMatchesResponse,
        gamesResponse,
        gamesRecentResponse,
    ] = await Promise.all([
        getTeamsByNames(teamNames),
        getTeamsRecentMatches(teamNames, tournamentName),
        getTournamentsGamesByTournamentOverviewPage(tournamentName),
        getTeamsRecentGames(teamNames, tournamentName),
    ])

    const teamsData = teamsDataResponse.data || []
    const teamsRecentMatches = teamsRecentMatchesResponse.data || []
    const games = gamesResponse.data || []

    const teamImagePromises = teamsData.map(async (team: Team) => {
        const teamImageResponse = await getTeamImage(
            team.image?.replace('.png', '') || ''
        )
        return {
            teamName: team.overviewPage,
            imageUrl: teamImageResponse.data || '',
        }
    })

    const teamImageResults = await Promise.all(teamImagePromises)

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
        gamesRecentResponse.data || [],
        games
    )

    return (
        <StandingsWithTabsClient
            processedData={processedData}
            highlightedTeam={highlightedTeam}
            maxRows={maxRows}
        />
    )
}
