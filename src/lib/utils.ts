import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Convert a league name to a URL-friendly slug
 *
 * @param name - The league name to convert
 * @returns A URL-friendly slug
 *
 * @example
 * ```ts
 * createLeagueSlug("La Ligue Française") // "la-ligue-francaise"
 * createLeagueSlug("World Championship") // "world-championship"
 * ```
 */
export function createLeagueSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD') // Normalize Unicode characters
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Keep only letters, numbers, spaces, dashes
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/-+/g, '-') // Remove multiple dashes
        .trim()
}