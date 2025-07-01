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

/**
 * Truncate text with ellipsis
 *
 * Truncates a string to a specified maximum length and adds ellipsis if needed.
 * Similar to the truncation logic used in the useTranslate hook.
 *
 * @param text - The text to truncate
 * @param maxLength - The maximum length before truncation
 * @returns The truncated text with ellipsis if needed
 *
 * @example
 * ```ts
 * truncateText("Hello World", 8) // "Hello..."
 * truncateText("Short", 10) // "Short"
 * truncateText("Very long text that needs truncation", 15) // "Very long text..."
 * ```
 *
 * @remarks
 * This function preserves the original text if it's shorter than or equal to maxLength.
 * When truncation is needed, it reserves 3 characters for the ellipsis ("...")
 * and truncates the text accordingly.
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + "...";
}
