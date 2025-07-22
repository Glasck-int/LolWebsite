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
