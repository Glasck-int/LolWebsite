// Types génériques pour les APIs
export interface PaginationParams {
    page?: number
    limit?: number
}

export interface SortParams {
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
    query?: string
}

// Types de réponse pour les listes
export interface ListResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
}