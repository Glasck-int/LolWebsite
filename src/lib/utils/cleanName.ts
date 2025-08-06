export function CleanName(teamName: string | null | undefined): string {
    if (!teamName) return ''
    
    // Remove parentheses and their content
    return teamName.replace(/\s*\([^)]*\)/g, '').trim()
}