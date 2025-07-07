import { Team as TeamType } from '../../../backend/src/generated/prisma'
import { getApiBaseUrl, apiRequest, ApiResponse } from './utils'

/**
 * Get a team by name
 *
 * @param name - The name of the team to fetch
 * @returns Promise with team data or error
 */
async function getTeamByName(name: string): Promise<ApiResponse<TeamType>> {
    return apiRequest<TeamType>(`/api/teams/name/${encodeURIComponent(name)}`)
}

/**
 * Get multiple teams by their names
 *
 * @param names - Array of team names to fetch
 * @returns Promise with array of team data or error
 */
async function getTeamsByNames(
    names: string[]
): Promise<ApiResponse<TeamType[]>> {
    const teamPromises = names.map((name) => getTeamByName(name))
    const results = await Promise.allSettled(teamPromises)

    const teams: TeamType[] = []
    const errors: string[] = []

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
            teams.push(result.value.data)
        } else {
            errors.push(`Failed to fetch team: ${names[index]}`)
        }
    })

    if (teams.length === 0 && errors.length > 0) {
        return { error: errors.join(', ') }
    }

    return { data: teams }
}

export { getTeamByName, getTeamsByNames }
