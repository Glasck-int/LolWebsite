/**
 * Standings components module.
 *
 * Exports all components related to displaying tournament standings and team statistics.
 * Provides a complete standings table with headers, rows, and data processing utilities.
 *
 * @module Standings
 */

export { StandingsHeader } from './StandingsHeader'
export { StandingsRow } from './StandingsRow'
export { StandingsOverview } from './StandingsOverview'
export {
    processStandingsData,
    type ProcessedStanding,
} from './StandingsDataProcessor'
export { type Column } from './types'
