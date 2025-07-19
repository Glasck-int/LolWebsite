// Types liés aux joueurs
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

export interface PlayerImageType {
    name: string
    imageUrl: string | null
}