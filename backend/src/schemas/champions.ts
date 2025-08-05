import { Type } from '@sinclair/typebox'

/**
 * Champion performance statistics schema
 */
export const ChampionStatsSchema = Type.Object({
    champion: Type.String({ description: 'Champion name' }),
    gamesPlayed: Type.Number({ description: 'Total games played with this champion' }),
    wins: Type.Number({ description: 'Total wins with this champion' }),
    losses: Type.Number({ description: 'Total losses with this champion' }),
    winRate: Type.Number({ 
        minimum: 0, 
        maximum: 100, 
        description: 'Win rate percentage (0-100)' 
    }),
    totalKills: Type.Number({ description: 'Total kills across all games' }),
    totalDeaths: Type.Number({ description: 'Total deaths across all games' }),
    totalAssists: Type.Number({ description: 'Total assists across all games' }),
    avgKills: Type.Number({ description: 'Average kills per game' }),
    avgDeaths: Type.Number({ description: 'Average deaths per game' }),
    avgAssists: Type.Number({ description: 'Average assists per game' }),
    kda: Type.Number({ description: 'KDA ratio ((kills + assists) / deaths)' }),
    avgGold: Type.Number({ description: 'Average gold earned per game' }),
    avgGoldPerMinute: Type.Number({ description: 'Average gold earned per minute' }),
    avgCs: Type.Number({ description: 'Average creep score per game' }),
    avgCsPerMinute: Type.Number({ description: 'Average creep score per minute' }),
    avgDamageToChampions: Type.Number({ description: 'Average damage to champions per game' }),
    avgVisionScore: Type.Number({ description: 'Average vision score per game' }),
    totalGold: Type.Number({ description: 'Total gold earned across all games' }),
    totalCs: Type.Number({ description: 'Total creep score across all games' }),
    totalDamageToChampions: Type.Number({ description: 'Total damage to champions across all games' }),
    totalVisionScore: Type.Number({ description: 'Total vision score across all games' }),
    pickRate: Type.Optional(Type.Number({ 
        minimum: 0, 
        maximum: 100, 
        description: 'Pick rate percentage in the context (0-100)' 
    })),
    banRate: Type.Optional(Type.Number({ 
        minimum: 0, 
        maximum: 100, 
        description: 'Ban rate percentage in the context (0-100)' 
    })),
    presenceRate: Type.Optional(Type.Number({ 
        minimum: 0, 
        maximum: 100, 
        description: 'Tournament presence rate percentage - picks + bans (0-100)' 
    })),
    avgKillParticipation: Type.Number({ 
        minimum: 0, 
        maximum: 100, 
        description: 'Average kill participation percentage ((kills + assists) / teamKills * 100)' 
    }),
    uniquePlayers: Type.Number({ 
        minimum: 0, 
        description: 'Number of unique players who played this champion' 
    }),
    avgDamagePerMinute: Type.Number({ 
        minimum: 0, 
        description: 'Average damage to champions per minute' 
    })
})

/**
 * Tournament champion statistics response schema
 */
export const TournamentChampionStatsResponseSchema = Type.Object({
    tournament: Type.String({ description: 'Tournament identifier' }),
    totalGames: Type.Number({ description: 'Total games in the tournament' }),
    uniqueChampions: Type.Number({ description: 'Number of unique champions played' }),
    champions: Type.Array(ChampionStatsSchema, { 
        description: 'Array of champion statistics ordered by games played (descending)' 
    }),
    meta: Type.Object({
        cached: Type.Boolean({ description: 'Whether response was cached' }),
        timestamp: Type.String({
            format: 'date-time',
            description: 'Response timestamp'
        })
    })
})

/**
 * Player champion statistics response schema
 */
export const PlayerChampionStatsResponseSchema = Type.Object({
    player: Type.String({ description: 'Player name' }),
    tournament: Type.Optional(Type.String({ description: 'Tournament identifier (if filtered)' })),
    totalGames: Type.Number({ description: 'Total games played by the player' }),
    uniqueChampions: Type.Number({ description: 'Number of unique champions played by the player' }),
    champions: Type.Array(ChampionStatsSchema, { 
        description: 'Array of champion statistics ordered by games played (descending)' 
    }),
    meta: Type.Object({
        cached: Type.Boolean({ description: 'Whether response was cached' }),
        timestamp: Type.String({
            format: 'date-time',
            description: 'Response timestamp'
        })
    })
})

/**
 * Team champion statistics response schema
 */
export const TeamChampionStatsResponseSchema = Type.Object({
    team: Type.String({ description: 'Team name' }),
    tournament: Type.Optional(Type.String({ description: 'Tournament identifier (if filtered)' })),
    totalGames: Type.Number({ description: 'Total games played by the team' }),
    uniqueChampions: Type.Number({ description: 'Number of unique champions played by the team' }),
    champions: Type.Array(ChampionStatsSchema, { 
        description: 'Array of champion statistics ordered by games played (descending)' 
    }),
    meta: Type.Object({
        cached: Type.Boolean({ description: 'Whether response was cached' }),
        timestamp: Type.String({
            format: 'date-time',
            description: 'Response timestamp'
        })
    })
})

/**
 * Champion statistics list response (used for multiple contexts)
 */
export const ChampionStatsListResponseSchema = Type.Array(ChampionStatsSchema)