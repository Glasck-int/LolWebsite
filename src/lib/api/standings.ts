import { MatchScheduleGame, Standings as StandingsType } from '@/generated/prisma'
import { getTeamsByNames, getTeamsRecentGames, getTeamsRecentMatches } from './teams'
import { getTeamImage } from './image'
import { getTournamentsGamesByTournamentOverviewPage } from './tournaments'
import { processStandingsData, ProcessedStanding } from '@/components/leagues/Standings/utils/StandingsDataProcessor'
import { Team } from '@/generated/prisma'

export interface EnrichedStandingsData {
  processedData: ProcessedStanding[]
  
  gamesData: MatchScheduleGame[]
}

export async function fetchEnrichedStandingsData(
  standings: StandingsType[],
  tournamentName: string
): Promise<EnrichedStandingsData> {
  if (!standings || standings.length === 0) {
    return { processedData: [], gamesData: [] }
  }

  try {
    const teamNames = standings
      .map((s) => s.team)
      .filter((name): name is string => !!name)

    const [
      teamsDataResponse,
      teamsRecentMatchesResponse,
      gamesRecentResponse,
      gamesResponse
    ] = await Promise.all([
      getTeamsByNames(teamNames),
      getTeamsRecentMatches(teamNames, tournamentName),
      getTeamsRecentGames(teamNames, tournamentName),
      getTournamentsGamesByTournamentOverviewPage(tournamentName)
    ])

    const teamsData = teamsDataResponse.data || []
    const teamsRecentMatches = teamsRecentMatchesResponse.data || []

    const teamImagePromises = teamsData.map(async (team: Team) => {
      // Essayer d'abord avec l'image de l'équipe si elle existe
      let teamImageResponse = await getTeamImage(
        team.image?.replace('.png', '.webp') || ''
      )

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
    const teamsImages: Record<string, string> = teamImageResults.reduce(
      (acc, result) => {
        if (result.teamName) {
          acc[result.teamName] = result.imageUrl
        }
        return acc
      },
      {} as Record<string, string>
    )

    const processedStandings = processStandingsData(
      standings,
      teamsData,
      teamsImages,
      teamsRecentMatches,
      gamesRecentResponse.data || [],
      gamesResponse?.data || []
    )

    return {
      processedData: processedStandings,
      gamesData: gamesResponse?.data || []
    }
  } catch (error) {
    console.error('Error fetching enriched standings data:', error)
    return { processedData: [], gamesData: [] }
  }
}

export async function fetchEnrichedStandingsOverviewData(
  standings: StandingsType[],
  tournamentName: string
): Promise<ProcessedStanding[]> {
  if (!standings || standings.length === 0) {
    return []
  }

  try {
    const teamNames = standings
      .map((s) => s.team)
      .filter((name): name is string => !!name)

    const [teamsDataResponse, teamsRecentMatchesResponse, gamesRecentResponse] = await Promise.all([
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

    const teamsImages: Record<string, string> = teamImageResults.reduce(
      (acc, result) => {
        if (result.teamName) {
          acc[result.teamName] = result.imageUrl
        }
        return acc
      },
      {} as Record<string, string>
    )

    const processedStandings = processStandingsData(
      standings,
      teamsData,
      teamsImages,
      teamsRecentMatches,
      gamesRecentResponse.data || [],
    )


    return processedStandings
  } catch (error) {
    console.error('Error fetching enriched standings overview data:', error)
    return []
  }
}