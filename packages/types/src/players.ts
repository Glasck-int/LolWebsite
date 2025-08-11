// Types liés aux joueurs
export interface PlayerStatsType {
    name: string
    link: string
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

export interface PlayerImageType {
    fileName: string
    link: string
    team: string | null
    tournament: string | null
    imageType: string | null
    caption: string | null
    isProfileImage: boolean | null
    createdAt: string
    updatedAt: string
}

export interface PlayerRedirectType {
    id: number
    name: string
    overviewPage: string
    images: PlayerImageType[] | null
}

export interface PlayerWithRedirects {
    id: number
    name: string
    nativeName?: string | null
    nameAlphabet?: string | null
    nameFull?: string | null
    country?: string | null
    nationality?: string | null
    nationalityPrimary?: string | null
    age?: string | null
    birthdate?: string | null
    deathdate?: string | null
    image?: string | null
    overviewPage: string
    residency?: string | null
    role?: string | null
    team?: string | null
    team2?: string | null
    teamSystem?: string | null
    team2System?: string | null
    teamLast?: string | null
    roleLast?: string | null
    isRetired?: boolean | null
    isLowercase?: boolean | null
    isSubstitute?: boolean | null
    isPersonality?: boolean | null
    toWildrift?: boolean | null
    toValorant?: boolean | null
    twitter?: string | null
    facebook?: string | null
    instagram?: string | null
    discord?: string | null
    stream?: string | null
    youtube?: string | null
    bluesky?: string | null
    askfm?: string | null
    reddit?: string | null
    snapchat?: string | null
    threads?: string | null
    linkedin?: string | null
    vk?: string | null
    website?: string | null
    weibo?: string | null
    updatedAt: string
    residencyFormer?: string | null
    favChamps?: string[] | null
    lolPros?: string | null
    soloQueueIds?: string[] | null
    birthdatePrecision?: string | null
    deathdatePrecision?: string | null
    playerId?: string | null
}

export interface PlayerSearchResult {
    id: number
    name: string
    overviewPage: string
}
