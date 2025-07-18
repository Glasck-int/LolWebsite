import { Type } from '@sinclair/typebox'

/**
 * Player Image schema for player images
 */
export const PlayerImageSchema = Type.Object({
    fileName: Type.String({
        minLength: 1,
        maxLength: 300,
        description: 'Image file name',
        examples: ['caps_2024.jpg', 'faker_profile.png'],
    }),
    link: Type.String({
        minLength: 1,
        maxLength: 200,
        description: 'Link to player (matches PlayerRedirect.name)',
        examples: ['Caps', 'Faker', 'Jankos'],
    }),
    team: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Team associated with the image',
            examples: ['G2 Esports', 'T1', 'Fnatic'],
        })
    ),
    tournament: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Tournament associated with the image',
            examples: ['LEC_2024_Spring', 'Worlds_2024'],
        })
    ),
    imageType: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 50,
            description: 'Type of image',
            examples: ['profile', 'action', 'team'],
        })
    ),
    caption: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 500,
            description: 'Image caption or description',
        })
    ),
    isProfileImage: Type.Optional(
        Type.Boolean({
            description: 'Whether this is the main profile image',
            examples: [true, false],
        })
    ),
    createdAt: Type.String({
        format: 'date-time',
        description: 'Image creation date',
    }),
    updatedAt: Type.String({
        format: 'date-time',
        description: 'Last update date',
    }),
})

/**
 * Player Redirect schema for name-to-player mapping
 */
export const PlayerRedirectSchema = Type.Object({
    id: Type.Number({
        description: 'Unique identifier for the player redirect entry',
        examples: [1, 2, 3],
    }),
    name: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Player name or alias that should redirect to the main player',
        examples: ['Caps', 'G2 Caps', 'Rasmus Winther'],
    }),
    overviewPage: Type.String({
        minLength: 1,
        maxLength: 200,
        description: 'Reference to the main player overview page',
        examples: ['Caps', 'Faker', 'Jankos'],
    }),
    images: Type.Optional(
        Type.Array(PlayerImageSchema, {
            description: 'Images associated with this player redirect/name',
        })
    ),
})

/**
 * Player schema with comprehensive player information
 */
export const PlayerSchema = Type.Object({
    id: Type.Number({
        description: 'Unique identifier for the player',
        examples: [1, 2, 3],
    }),
    name: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Player name',
        examples: ['Caps', 'Faker', 'Jankos'],
    }),
    nativeName: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Player name in native language',
            examples: ['이상혁', 'Rasmus Winther'],
        })
    ),
    nameAlphabet: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Player name in alphabet form',
        })
    ),
    nameFull: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Full player name',
            examples: ['Rasmus Winther', 'Lee Sang-hyeok'],
        })
    ),
    country: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Player country',
            examples: ['Denmark', 'South Korea', 'Poland'],
        })
    ),
    nationality: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Player nationality',
            examples: ['Danish', 'Korean', 'Polish'],
        })
    ),
    nationalityPrimary: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Primary nationality',
        })
    ),
    age: Type.Optional(
        Type.String({
            description: 'Player age',
            examples: ['24', '27', '30'],
        })
    ),
    birthdate: Type.Optional(
        Type.String({
            format: 'date-time',
            description: 'Player birthdate',
        })
    ),
    deathdate: Type.Optional(
        Type.String({
            format: 'date-time',
            description: 'Player deathdate (if applicable)',
        })
    ),
    image: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 300,
            description: 'Player image URL',
        })
    ),
    overviewPage: Type.String({
        minLength: 1,
        maxLength: 200,
        description: 'Player overview page identifier',
        examples: ['Caps', 'Faker', 'Jankos'],
    }),
    residency: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Player residency',
            examples: ['EU', 'KR', 'NA'],
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
    team: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Current team',
            examples: ['G2 Esports', 'T1', 'Fnatic'],
        })
    ),
    team2: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Secondary team',
        })
    ),
    teamSystem: Type.Optional(
        Type.String({
            description: 'Team system information',
        })
    ),
    team2System: Type.Optional(
        Type.String({
            description: 'Secondary team system information',
        })
    ),
    teamLast: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Last team',
        })
    ),
    roleLast: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 50,
            description: 'Last role',
        })
    ),
    isRetired: Type.Optional(
        Type.Boolean({
            description: 'Whether the player is retired',
            examples: [true, false],
        })
    ),
    isLowercase: Type.Optional(
        Type.Boolean({
            description: 'Whether the player name should be lowercase',
        })
    ),
    isSubstitute: Type.Optional(
        Type.Boolean({
            description: 'Whether the player is a substitute',
        })
    ),
    isPersonality: Type.Optional(
        Type.Boolean({
            description: 'Whether the player is a personality/content creator',
        })
    ),
    toWildrift: Type.Optional(
        Type.Boolean({
            description: 'Whether the player moved to Wild Rift',
        })
    ),
    toValorant: Type.Optional(
        Type.Boolean({
            description: 'Whether the player moved to Valorant',
        })
    ),
    twitter: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Twitter handle',
        })
    ),
    facebook: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Facebook profile',
        })
    ),
    instagram: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Instagram handle',
        })
    ),
    discord: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Discord username',
        })
    ),
    stream: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Stream URL',
        })
    ),
    youtube: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'YouTube channel',
        })
    ),
    bluesky: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Bluesky handle',
        })
    ),
    askfm: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Ask.fm profile',
        })
    ),
    reddit: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Reddit username',
        })
    ),
    snapchat: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Snapchat username',
        })
    ),
    threads: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Threads handle',
        })
    ),
    linkedin: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'LinkedIn profile',
        })
    ),
    vk: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'VK profile',
        })
    ),
    website: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Personal website',
        })
    ),
    weibo: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'Weibo profile',
        })
    ),
    updatedAt: Type.String({
        format: 'date-time',
        description: 'Last update date',
    }),
    residencyFormer: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Former residency',
        })
    ),
    favChamps: Type.Array(
        Type.String({
            description: 'Favorite champions',
            examples: ['Azir', 'LeBlanc', 'Yasuo'],
        })
    ),
    lolPros: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 200,
            description: 'LoL Pros profile',
        })
    ),
    soloQueueIds: Type.Array(
        Type.String({
            description: 'Solo queue identifiers',
        })
    ),
    birthdatePrecision: Type.Optional(
        Type.String({
            format: 'date-time',
            description: 'Birthdate precision',
        })
    ),
    deathdatePrecision: Type.Optional(
        Type.String({
            format: 'date-time',
            description: 'Deathdate precision',
        })
    ),
    playerId: Type.Optional(
        Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'Player ID',
        })
    ),
})

/**
 * Player with redirects schema - includes all player redirects and images
 */
export const PlayerWithRedirectsSchema = Type.Object({
    ...PlayerSchema.properties,
    redirects: Type.Array(PlayerRedirectSchema, {
        description: 'All name redirects for this player',
    }),
    images: Type.Array(PlayerImageSchema, {
        description: 'All images associated with this player',
    }),
})

/**
 * Response arrays
 */
export const PlayerImageListResponse = Type.Array(PlayerImageSchema)
export const PlayerRedirectListResponse = Type.Array(PlayerRedirectSchema)
export const PlayerListResponse = Type.Array(PlayerSchema)
export const PlayerWithRedirectsListResponse = Type.Array(PlayerWithRedirectsSchema)

