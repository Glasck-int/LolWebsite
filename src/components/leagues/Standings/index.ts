/**
 * Standings components module.
 *
 * Exports all components related to displaying tournament standings and team statistics.
 * Provides a complete standings table with headers, rows, and data processing utilities.
 *
 * @module Standings
 */

// Components
export { StandingsHeader } from './components/StandingsHeader'
export { StandingsRow } from './components/StandingsRow'
export { StandingsRows } from './components/StandingsRows'

// Views
export { StandingsOverview } from './views/StandingsOverview'
export { StandingsWithTabs } from './views/StandingsWithTabs'
export { StandingsOverviewFetch } from './views/StandingsOverviewFetch'
export { NewStandingsWithTabsFetch } from './views/NewStandingsWithTabsFetch'
export { TournamentContentFetch } from './views/TournamentContentFetch'

// Clients
export { StandingsOverviewClient } from './clients/StandingsOverviewClient'
export { StandingsWithTabsClient } from './clients/StandingsWithTabsClient'
export { NewStandingsWithTabsClient } from './clients/NewStandingsWithTabsClient'

// New Table Components
export { StandingsTable, CombinedStandingsTable } from './components/StandingsTable'
export { StandingsWithTabs as NewStandingsWithTabs } from './components/StandingsWithTabs'

// Utils
export {
    processStandingsData,
    processGamesData,
    type ProcessedStanding,
    type ProcessedGameStats,
} from './utils/StandingsDataProcessor'
export { SortedRows } from './utils/SortedRows'

// Playoff Components
export { PlayoffBracket } from './playOff/PlayoffBracket'

// Types
export { type Column } from './types'
