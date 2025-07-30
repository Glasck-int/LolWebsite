/**
 * @fileoverview Generic cache utilities for Zustand stores
 * Provides reusable functions to create, validate and manage cache items
 */

/**
 * Interface for a cache item with metadata
 * @template T - Type of data stored in the cache
 */
export interface CacheItem<T> {
    /** The cached data */
    data: T
    /** Cache timestamp (Date.now()) */
    cachedAt: number
    /** Indicates if a request is in progress */
    loading: boolean
    /** Error message if the last operation failed */
    error: string | null
}

/**
 * Interface for cache state in a store
 * @template T - Type of data stored in the cache
 */
export interface CacheState<T> {
    /** Dictionary of cached items, indexed by key */
    cache: Record<string | number, CacheItem<T>>
}

/**
 * Creates a set of utilities to manage cache with configurable lifetime
 * 
 * @template T - Type of data to cache
 * @param {number} [cacheTimeout=300000] - Cache lifetime in milliseconds (default: 5 minutes)
 * @param {() => T} [getDefaultData] - Function to generate default data when needed
 * @returns {Object} Set of utility functions for cache management
 * 
 * @example
 * ```typescript
 * interface UserData { id: number; name: string }
 * const cacheHelpers = createCacheHelpers<UserData>(10 * 60 * 1000) // 10 minutes
 * 
 * // In a Zustand store
 * const useUserStore = create((set, get) => ({
 *   usersCache: {},
 *   
 *   getUser: (id: number) => {
 *     const cached = cacheHelpers.getCachedItem(get().usersCache, id)
 *     return cached?.data || null
 *   }
 * }))
 * ```
 */
export const createCacheHelpers = <T>(
    cacheTimeout: number = 5 * 60 * 1000,
    getDefaultData?: () => T
) => {
    /**
     * Checks if a cache item is still valid
     * @param {number} cachedAt - Cache timestamp
     * @returns {boolean} true if the cache is still valid
     */
    const isCacheValid = (cachedAt: number): boolean => {
        return Date.now() - cachedAt < cacheTimeout
    }

    /**
     * Creates a new cache item with data
     * @param {T} data - The data to cache
     * @returns {CacheItem<T>} New cache item
     */
    const createCacheItem = (data: T): CacheItem<T> => ({
        data,
        cachedAt: Date.now(),
        loading: false,
        error: null
    })

    /**
     * Creates a cache item in loading state
     * @param {T} [existingData] - Existing data to keep during loading
     * @returns {CacheItem<T>} Cache item in loading state
     */
    const createLoadingCacheItem = (existingData?: T): CacheItem<T> => ({
        data: existingData || ({} as T),
        cachedAt: Date.now(),
        loading: true,
        error: null
    })

    /**
     * Creates a cache item with an error
     * @param {string} error - Error message
     * @param {T} [existingData] - Existing data to keep on error
     * @returns {CacheItem<T>} Cache item with error
     */
    const createErrorCacheItem = (error: string, existingData?: T): CacheItem<T> => ({
        data: existingData || ({} as T),
        cachedAt: Date.now(),
        loading: false,
        error
    })

    /**
     * Retrieves a cache item if it's valid
     * @template K - Type of the key (string | number)
     * @param {Record<K, CacheItem<T>>} cache - The cache to query
     * @param {K} key - The key of the item to retrieve
     * @returns {CacheItem<T> | null} The cache item or null if it doesn't exist/is expired
     */
    const getCachedItem = <K extends string | number>(
        cache: Record<K, CacheItem<T>>,
        key: K
    ): CacheItem<T> | null => {
        const cached = cache[key]
        if (!cached) return null
        
        if (!isCacheValid(cached.cachedAt)) {
            return null
        }
        
        return cached
    }

    /**
     * Adds or updates an item in the cache
     * @template K - Type of the key (string | number)
     * @param {Record<K, CacheItem<T>>} cache - The cache to modify
     * @param {K} key - The key of the item
     * @param {T} data - The new data to cache
     * @returns {Record<K, CacheItem<T>>} New cache with the item added/updated
     */
    const setCachedItem = <K extends string | number>(
        cache: Record<K, CacheItem<T>>,
        key: K,
        data: T
    ): Record<K, CacheItem<T>> => ({
        ...cache,
        [key]: createCacheItem(data)
    })

    /**
     * Updates the loading state of a cache item
     * @template K - Type of the key (string | number)
     * @param {Record<K, CacheItem<T>>} cache - The cache to modify
     * @param {K} key - The key of the item
     * @param {boolean} loading - New loading state
     * @returns {Record<K, CacheItem<T>>} New cache with updated loading state
     */
    const setCacheLoading = <K extends string | number>(
        cache: Record<K, CacheItem<T>>,
        key: K,
        loading: boolean
    ): Record<K, CacheItem<T>> => {
        const existing = cache[key]
        return {
            ...cache,
            [key]: {
                data: existing?.data || (getDefaultData ? getDefaultData() : {} as T),
                cachedAt: existing?.cachedAt || Date.now(),
                loading,
                error: existing?.error || null
            }
        }
    }

    /**
     * Updates the error of a cache item
     * @template K - Type of the key (string | number)
     * @param {Record<K, CacheItem<T>>} cache - The cache to modify
     * @param {K} key - The key of the item
     * @param {string | null} error - Error message or null to clear the error
     * @returns {Record<K, CacheItem<T>>} New cache with updated error
     */
    const setCacheError = <K extends string | number>(
        cache: Record<K, CacheItem<T>>,
        key: K,
        error: string | null
    ): Record<K, CacheItem<T>> => {
        const existing = cache[key]
        return {
            ...cache,
            [key]: {
                data: existing?.data || (getDefaultData ? getDefaultData() : {} as T),
                cachedAt: existing?.cachedAt || Date.now(),
                loading: false,
                error
            }
        }
    }

    /**
     * Removes all expired items from the cache
     * @template K - Type of the key (string | number)
     * @param {Record<K, CacheItem<T>>} cache - The cache to clean
     * @returns {Record<K, CacheItem<T>>} New cache without expired items
     */
    const removeExpiredItems = <K extends string | number>(
        cache: Record<K, CacheItem<T>>
    ): Record<K, CacheItem<T>> => {
        return Object.entries(cache).reduce((acc, [key, value]) => {
            if (value && isCacheValid(value.cachedAt)) {
                acc[key as K] = value as CacheItem<T>
            }
            return acc
        }, {} as Record<K, CacheItem<T>>)
    }

    /**
     * Removes a specific item from the cache
     * @template K - Type of the key (string | number)
     * @param {Record<K, CacheItem<T>>} cache - The cache to modify
     * @param {K} key - The key of the item to remove
     * @returns {Record<K, CacheItem<T>>} New cache without the removed item
     */
    const removeCacheItem = <K extends string | number>(
        cache: Record<K, CacheItem<T>>,
        key: K
    ): Record<K, CacheItem<T>> => {
        const { [key]: _, ...rest } = cache
        return rest
    }

    return {
        isCacheValid,
        createCacheItem,
        createLoadingCacheItem,
        createErrorCacheItem,
        getCachedItem,
        setCachedItem,
        setCacheLoading,
        setCacheError,
        removeExpiredItems,
        removeCacheItem
    }
}