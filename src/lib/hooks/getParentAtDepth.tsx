export function getParentAtDepth(
    element: HTMLElement | null,
    depth: number = 1
): HTMLElement | null {
    let current: HTMLElement | null = element
    let lastValidParent: HTMLElement | null = element

    console.log("aloo")
    if (depth < 1 || !element)
        return null
    console.log("current", current)
    current = current?.parentElement ?? null
    lastValidParent = current
    console.log("lastValidParent ", lastValidParent)
    for (let i = 1; i < depth; i++) {
        current = current?.parentElement ?? null
        if (!current) break
        lastValidParent = current
    }
    return lastValidParent
}
