import { Type } from '@sinclair/typebox'

/**
 * Scoreboard Player schema with comprehensive field descriptions and validation
 */
export const ScoreboardPlayerSchema = Type.Object({
    id: Type.Number({
        description: 'Unique identifier for the scoreboard player entry',
        examples: [1, 2, 3],
    }),
    overviewPage: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 300,
            description: 'Tournament overview page identifier',
            examples: ['LEC_2024_Spring', 'Worlds_2024_Main'],
        })
    ),
    name: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Player name',
            examples: ['Caps', 'Faker', 'Jankos'],
        })
    ),
    link: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Player profile link/identifier',
            examples: ['Caps', 'Faker', 'Jankos'],
        })
    ),
    champion: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 50,
            description: 'Champion played in this game',
            examples: ['Azir', 'LeBlanc', 'Graves'],
        })
    ),
    kills: Type.Optional(
        Type.Number({
            minimum: 0,
            description: 'Number of kills by the player',
            examples: [5, 3, 8],
        })
    ),
    deaths: Type.Optional(
        Type.Number({
            minimum: 0,
            description: 'Number of deaths by the player',
            examples: [2, 1, 4],
        })
    ),
    assists: Type.Optional(
        Type.Number({
            minimum: 0,
            description: 'Number of assists by the player',
            examples: [7, 12, 3],
        })
    ),
    summonerSpells: Type.Array(
        Type.String({
            description: 'Summoner spells used by the player',
            examples: ['Flash', 'Teleport', 'Ignite'],
        })
    ),
    gold: Type.Optional(
        Type.Number({
            minimum: 0,
            description: 'Gold earned by the player',
            examples: [15420, 12300, 18750],
        })
    ),
    cs: Type.Optional(
        Type.Number({
            minimum: 0,
            description: 'Creep score (minions + monsters killed)',
            examples: [245, 180, 320],
        })
    ),
    damageToChampions: Type.Optional(
        Type.Number({
            minimum: 0,
            description: 'Damage dealt to enemy champions',
            examples: [25000, 18000, 35000],
        })
    ),
    visionScore: Type.Optional(
        Type.Number({
            minimum: 0,
            description: 'Vision score of the player',
            examples: [45, 62, 28],
        })
    ),
    items: Type.Array(
        Type.String({
            description: 'Items purchased by the player',
            examples: ["Luden's Tempest", "Zhonya's Hourglass", 'Void Staff'],
        })
    ),
    trinket: Type.Optional(
        Type.String({
            description: 'Trinket item used by the player',
            examples: ['Stealth Ward', 'Oracle Lens', 'Farsight Alteration'],
        })
    ),
    keystoneMastery: Type.Optional(
        Type.String({
            description: 'Keystone mastery/rune used',
            examples: ['Electrocute', 'Conqueror', 'Phase Rush'],
        })
    ),
    keystoneRune: Type.Optional(
        Type.String({
            description: 'Keystone rune used by the player',
            examples: ['Electrocute', 'Conqueror', 'Phase Rush'],
        })
    ),
    primaryTree: Type.Optional(
        Type.String({
            description: 'Primary rune tree',
            examples: ['Domination', 'Precision', 'Sorcery'],
        })
    ),
    secondaryTree: Type.Optional(
        Type.String({
            description: 'Secondary rune tree',
            examples: ['Inspiration', 'Resolve', 'Domination'],
        })
    ),
    runes: Type.Optional(
        Type.String({
            description: 'Complete rune setup information',
        })
    ),
    teamKills: Type.Optional(
        Type.Number({
            minimum: 0,
            description: "Total kills by the player's team",
            examples: [15, 8, 22],
        })
    ),
    teamGold: Type.Optional(
        Type.Number({
            minimum: 0,
            description: "Total gold earned by the player's team",
            examples: [65000, 48000, 75000],
        })
    ),
    team: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Team name',
            examples: ['G2 Esports', 'T1', 'Fnatic'],
        })
    ),
    teamVs: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Opposing team name',
            examples: ['MAD Lions', 'GenG', 'Cloud9'],
        })
    ),
    time: Type.Optional(
        Type.String({
            format: 'date-time',
            description: 'Game time/timestamp',
        })
    ),
    playerWin: Type.Optional(
        Type.String({
            description: 'Whether the player won the game',
            examples: ['Yes', 'No'],
        })
    ),
    dateTime_UTC: Type.Optional(
        Type.String({
            format: 'date-time',
            description: 'Game date and time in UTC',
        })
    ),
    dst: Type.Optional(
        Type.String({
            description: 'Daylight saving time information',
        })
    ),
    tournament: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Tournament name or identifier',
            examples: ['LEC_2024_Spring', 'Worlds_2024'],
        })
    ),
    role: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 50,
            description: 'Player role/position',
            examples: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
        })
    ),
    role_Number: Type.Optional(
        Type.Number({
            minimum: 1,
            maximum: 5,
            description: 'Numeric representation of role (1-5)',
            examples: [1, 2, 3, 4, 5],
        })
    ),
    ingameRole: Type.Optional(
        Type.String({
            description: 'In-game role assignment',
        })
    ),
    side: Type.Optional(
        Type.Number({
            description: 'Side of the map (blue/red side)',
            examples: [100, 200],
        })
    ),
    uniqueLine: Type.Optional(
        Type.String({
            description: 'Unique identifier for this player entry',
        })
    ),
    uniqueLineVs: Type.Optional(
        Type.String({
            description: 'Unique identifier for versus matchup',
        })
    ),
    uniqueRole: Type.Optional(
        Type.String({
            description: 'Unique role identifier',
        })
    ),
    uniqueRoleVs: Type.Optional(
        Type.String({
            description: 'Unique role identifier for versus matchup',
        })
    ),
    gameId: Type.Optional(
        Type.String({
            description: 'Game identifier',
        })
    ),
    matchId: Type.Optional(
        Type.String({
            description: 'Match identifier',
        })
    ),
    gameTeamId: Type.Optional(
        Type.String({
            description: 'Game team identifier',
        })
    ),
    gameRoleId: Type.Optional(
        Type.String({
            description: 'Game role identifier',
        })
    ),
    gameRoleIdVs: Type.Optional(
        Type.String({
            description: 'Game role identifier for versus matchup',
        })
    ),
    statsPage: Type.Optional(
        Type.String({
            description: 'Statistics page reference',
        })
    ),
    createdAt: Type.String({
        format: 'date-time',
        description: 'Creation date of the player entry in db',
    }),
    updatedAt: Type.String({
        format: 'date-time',
        description: 'Last update date of the player entry in db',
    }),
})

/**
 * Player stats aggregated schema
 */
export const PlayerStatsSchema = Type.Object({
    name: Type.String({
        description: 'Player name',
        examples: ['Caps', 'Faker', 'Jankos'],
    }),
    team: Type.String({
        description: 'Team name',
        examples: ['G2 Esports', 'T1', 'Fnatic'],
    }),
    role: Type.String({
        description: 'Player role/position',
        examples: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
    }),
    gamesPlayed: Type.Number({
        minimum: 0,
        description: 'Total games played',
        examples: [10, 15, 8],
    }),
    avgKills: Type.Number({
        minimum: 0,
        description: 'Average kills per game',
        examples: [3.5, 2.1, 4.8],
    }),
    avgDeaths: Type.Number({
        minimum: 0,
        description: 'Average deaths per game',
        examples: [2.3, 1.8, 3.2],
    }),
    avgAssists: Type.Number({
        minimum: 0,
        description: 'Average assists per game',
        examples: [8.2, 6.5, 9.1],
    }),
    kda: Type.Number({
        minimum: 0,
        description: 'Kill/Death/Assist ratio',
        examples: [2.5, 4.2, 1.8],
    }),
    totalKills: Type.Number({
        minimum: 0,
        description: 'Total kills across all games',
        examples: [35, 21, 48],
    }),
    totalDeaths: Type.Number({
        minimum: 0,
        description: 'Total deaths across all games',
        examples: [23, 18, 32],
    }),
    totalAssists: Type.Number({
        minimum: 0,
        description: 'Total assists across all games',
        examples: [82, 65, 91],
    }),
    avgDamage: Type.Number({
        minimum: 0,
        description: 'Average damage to champions per game',
        examples: [25000, 18000, 35000],
    }),
    avgGold: Type.Number({
        minimum: 0,
        description: 'Average gold per game',
        examples: [15420, 12300, 18750],
    }),
    avgCS: Type.Number({
        minimum: 0,
        description: 'Average creep score per game',
        examples: [245.5, 180.2, 320.1],
    }),
    avgVisionScore: Type.Number({
        minimum: 0,
        description: 'Average vision score per game',
        examples: [45.2, 62.1, 28.5],
    }),
    winRate: Type.Number({
        minimum: 0,
        maximum: 100,
        description: 'Win rate percentage',
        examples: [65.5, 80.0, 45.2],
    }),
})

export interface PlayerStatsType {
    name: string
    team: string
    role: string
    gamesPlayed: number
    avgKills: number
    avgDeaths: number
    avgAssists: number
    kda: number
    totalKills: number
    totalDeaths: number
    totalAssists: number
    avgDamage: number
    avgGold: number
    avgCS: number
    avgVisionScore: number
    winRate: number
}

/**
 * Response arrays
 */
export const ScoreboardPlayersListResponse = Type.Array(ScoreboardPlayerSchema)
export const PlayerStatsListResponse = Type.Object({
    players: Type.Array(PlayerStatsSchema),
})
