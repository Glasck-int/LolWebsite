interface TournamentResponse {
    tournament: string
    id: number
}

interface SplitResponse {
    split?: string
    tournaments: TournamentResponse[]
}

interface SeasonResponse {
    season: string
    data: SplitResponse[]
}

export type { TournamentResponse, SplitResponse, SeasonResponse }
