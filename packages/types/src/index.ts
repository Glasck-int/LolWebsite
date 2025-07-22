// Types API partagés entre frontend et backend
export * from './players'
export * from './api'
export * from './seasons'

// Types utilitaires communs
export interface ApiResponse<T> {
    data?: T
    error?: string
}