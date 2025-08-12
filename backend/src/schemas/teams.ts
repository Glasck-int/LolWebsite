import { Type } from '@sinclair/typebox'

/**
 * Team schema with comprehensive field descriptions and validation
 */
export const TeamSchema = Type.Object({
    id: Type.Number({ 
        description: 'Unique team identifier' 
    }),
    name: Type.String({ 
        minLength: 1,
        maxLength: 100,
        description: 'Team name',
        examples: ['G2 Esports', 'T1', 'Fnatic']
    }),
    short: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 10,
        description: 'Team abbreviation/short name',
        examples: ['G2', 'T1', 'FNC']
    })),
    location: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 100,
        description: 'Team location/city',
        examples: ['Berlin', 'Seoul', 'London']
    })),
    region: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 50,
        description: 'Team region',
        examples: ['Europe', 'Korea', 'North America']
    })),
    image: Type.Optional(Type.String({ 
        format: 'uri',
        description: 'Team logo image URL',
        examples: ['https://example.com/team-logo.png']
    })),
    isDisbanded: Type.Boolean({ 
        description: 'Whether the team is disbanded',
        examples: [false, true]
    }),
    youtube: Type.Optional(Type.String({ 
        format: 'uri',
        description: 'YouTube channel URL',
        examples: ['https://youtube.com/@g2esports']
    })),
    twitter: Type.Optional(Type.String({ 
        format: 'uri',
        description: 'Twitter/X profile URL',
        examples: ['https://twitter.com/g2esports']
    })),
    instagram: Type.Optional(Type.String({ 
        format: 'uri',
        description: 'Instagram profile URL',
        examples: ['https://instagram.com/g2esports']
    })),
    facebook: Type.Optional(Type.String({ 
        format: 'uri',
        description: 'Facebook page URL',
        examples: ['https://facebook.com/g2esports']
    })),
    vk: Type.Optional(Type.String({ 
        format: 'uri',
        description: 'VK profile URL',
        examples: ['https://vk.com/g2esports']
    })),
    bluesky: Type.Optional(Type.String({ 
        format: 'uri',
        description: 'Bluesky profile URL',
        examples: ['https://bsky.app/profile/g2esports']
    })),
    discord: Type.Optional(Type.String({ 
        description: 'Discord server invite or ID',
        examples: ['https://discord.gg/g2esports']
    })),
    subreddit: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 50,
        description: 'Reddit subreddit name',
        examples: ['G2eSports', 'TeamSoloMid']
    })),
    snapchat: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 50,
        description: 'Snapchat username',
        examples: ['g2esports']
    })),
    renamedTo: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 100,
        description: 'New team name if renamed',
        examples: ['New Team Name']
    })),
    isLowercase: Type.Boolean({ 
        description: 'Whether team name should be displayed in lowercase',
        examples: [false, true]
    }),
    overviewPage: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 200,
        description: 'Team overview page identifier',
        examples: ['G2_Esports', 'T1_Official']
    })),
    updatedAt: Type.String({ 
        format: 'date-time',
        description: 'Last update timestamp',
        examples: ['2024-01-15T10:30:00Z']
    }),
    latestLeague: Type.Optional(Type.Object({
        id: Type.Number({ 
            description: 'League unique identifier' 
        }),
        name: Type.String({ 
            description: 'League name',
            examples: ['League of Legends Championship Series', 'LoL Champions Korea']
        }),
        createdAt: Type.String({ 
            format: 'date-time',
            description: 'League creation timestamp' 
        }),
        updatedAt: Type.String({ 
            format: 'date-time',
            description: 'League last update timestamp' 
        }),
        slug: Type.Union([Type.String(), Type.Null()], { 
            description: 'League URL slug' 
        }),
        short: Type.String({ 
            description: 'League short name/abbreviation',
            examples: ['LCS', 'LCK', 'LEC']
        }),
        region: Type.String({ 
            description: 'League region',
            examples: ['North America', 'Korea', 'Europe']
        }),
        level: Type.String({ 
            description: 'League level/tier',
            examples: ['Primary', 'Secondary', 'Academy']
        }),
        isOfficial: Type.Boolean({ 
            description: 'Whether the league is official' 
        }),
        isMajor: Type.Boolean({ 
            description: 'Whether the league is a major league' 
        }),
    }, {
        description: 'Latest league the team participated in',
        examples: [{
            id: 1,
            name: 'League of Legends Championship Series',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            slug: 'lcs',
            short: 'LCS',
            region: 'North America',
            level: 'Primary',
            isOfficial: true,
            isMajor: true
        }]
    })),
    // PlayerImage: Type.Array(PlayerImageSchema),
    // ScoreboardTeam: Type.Array(ScoreboardTeamSchema),
    // Standings: Type.Array(StandingsSchema),
})

/**
 * Schema for creating a new team
 */
export const CreateTeamSchema = Type.Object({
    name: Type.String({ 
        minLength: 1,
        maxLength: 100,
        description: 'Team name',
        examples: ['G2 Esports', 'T1']
    }),
    short: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 10,
        description: 'Team abbreviation',
        examples: ['G2', 'T1']
    })),
    location: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 100,
        description: 'Team location',
        examples: ['Berlin', 'Seoul']
    })),
    region: Type.Optional(Type.String({ 
        minLength: 1,
        maxLength: 50,
        description: 'Team region',
        examples: ['Europe', 'Korea']
    })),
    image: Type.Optional(Type.String({ 
        format: 'uri',
        description: 'Team logo URL'
    })),
    isDisbanded: Type.Optional(Type.Boolean({ 
        default: false,
        description: 'Whether the team is disbanded'
    })),
    isLowercase: Type.Optional(Type.Boolean({ 
        default: false,
        description: 'Whether team name should be lowercase'
    })),
    // Social media fields
    youtube: Type.Optional(Type.String({ format: 'uri' })),
    twitter: Type.Optional(Type.String({ format: 'uri' })),
    instagram: Type.Optional(Type.String({ format: 'uri' })),
    facebook: Type.Optional(Type.String({ format: 'uri' })),
    vk: Type.Optional(Type.String({ format: 'uri' })),
    bluesky: Type.Optional(Type.String({ format: 'uri' })),
    discord: Type.Optional(Type.String()),
    subreddit: Type.Optional(Type.String({ maxLength: 50 })),
    snapchat: Type.Optional(Type.String({ maxLength: 50 })),
})

/**
 * Schema for updating a team
 */
export const UpdateTeamSchema = Type.Partial(CreateTeamSchema)

export const TeamListResponse = Type.Array(TeamSchema)
