/**
 * Smart Caching Strategy
 *
 * This module provides intelligent caching with TTL, invalidation by tags,
 * and automatic cache management for better performance.
 */

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: readonly string[]
  version?: string
}

export interface CacheConfig {
  ttl: number
  tags: readonly string[]
  version?: string
}

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
  permissions: {
    ttl: 5 * 60 * 1000, // 5 minutes
    tags: ["user", "permissions"],
  },
  companies: {
    ttl: 30 * 60 * 1000, // 30 minutes
    tags: ["user", "companies"],
  },
  decimals: {
    ttl: 60 * 60 * 1000, // 1 hour
    tags: ["company", "settings"],
  },
  userTransactions: {
    ttl: 10 * 60 * 1000, // 10 minutes
    tags: ["user", "transactions"],
  },
  notifications: {
    ttl: 2 * 60 * 1000, // 2 minutes
    tags: ["user", "notifications"],
  },
  userProfile: {
    ttl: 60 * 60 * 1000, // 1 hour
    tags: ["user", "profile"],
  },
} as const

/**
 * In-memory cache with Map
 */
class SmartCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private maxSize = 1000 // Maximum cache entries
  private cleanupInterval = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Start cleanup interval
    setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  /**
   * Get cached data with TTL validation
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>

    if (!entry) {
      return null
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access time for LRU
    entry.timestamp = Date.now()
    return entry.data
  }

  /**
   * Set cached data with configuration
   */
  set<T>(key: string, data: T, config: CacheConfig): void {
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      tags: config.tags,
      version: config.version,
    }

    this.cache.set(key, entry)
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Invalidate cache by tags
   */
  invalidateByTags(tags: string[]): number {
    let invalidatedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some((tag) => tags.includes(tag))) {
        this.cache.delete(key)
        invalidatedCount++
      }
    }

    console.log(
      `🗑️ [SmartCache] Invalidated ${invalidatedCount} entries by tags:`,
      tags
    )
    return invalidatedCount
  }

  /**
   * Invalidate cache by pattern
   */
  invalidateByPattern(pattern: RegExp): number {
    let invalidatedCount = 0

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        invalidatedCount++
      }
    }

    console.log(
      `🗑️ [SmartCache] Invalidated ${invalidatedCount} entries by pattern:`,
      pattern
    )
    return invalidatedCount
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    console.log("🗑️ [SmartCache] All cache entries cleared")
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let totalSize = 0

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++
      }
      totalSize += JSON.stringify(entry.data).length
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      hitRate: this.calculateHitRate(),
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 [SmartCache] Cleaned up ${cleanedCount} expired entries`)
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey = ""
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      console.log(`🗑️ [SmartCache] Evicted oldest entry: ${oldestKey}`)
    }
  }

  /**
   * Calculate cache hit rate (simplified)
   */
  private calculateHitRate(): string {
    // This is a simplified implementation
    // In a real app, you'd track hits/misses over time
    return "N/A"
  }
}

/**
 * Global cache instance
 */
export const smartCache = new SmartCache()

/**
 * Cache key generators
 */
export const cacheKeys = {
  permissions: (userId: string, companyId: string) =>
    `permissions:${userId}:${companyId}`,
  companies: (userId: string) => `companies:${userId}`,
  decimals: (companyId: string) => `decimals:${companyId}`,
  userTransactions: (userId: string, companyId: string) =>
    `transactions:${userId}:${companyId}`,
  notifications: (userId: string) => `notifications:${userId}`,
  userProfile: (userId: string) => `profile:${userId}`,
}

/**
 * Generic cache wrapper for async functions
 */
export const withCache = async <T>(
  key: string,
  config: CacheConfig,
  fn: () => Promise<T>
): Promise<T> => {
  // Try to get from cache first
  const cached = smartCache.get<T>(key)
  if (cached !== null) {
    console.log(`✅ [SmartCache] Cache hit for key: ${key}`)
    return cached
  }

  console.log(`❌ [SmartCache] Cache miss for key: ${key}, fetching...`)

  try {
    // Fetch fresh data
    const data = await fn()

    // Cache the result
    smartCache.set(key, data, config)

    return data
  } catch (error) {
    console.error(`❌ [SmartCache] Error fetching data for key: ${key}`, error)
    throw error
  }
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  /**
   * Invalidate all user-related cache when user logs out
   */
  onUserLogout: (userId: string) => {
    smartCache.invalidateByTags(["user"])
    console.log(`🗑️ [SmartCache] Invalidated user cache for user: ${userId}`)
  },

  /**
   * Invalidate company-related cache when company switches
   */
  onCompanySwitch: (companyId: string) => {
    smartCache.invalidateByTags(["company"])
    console.log(
      `🗑️ [SmartCache] Invalidated company cache for company: ${companyId}`
    )
  },

  /**
   * Invalidate permission cache when permissions change
   */
  onPermissionsChange: (userId: string, companyId: string) => {
    smartCache.delete(cacheKeys.permissions(userId, companyId))
    smartCache.invalidateByTags(["permissions"])
    console.log(`🗑️ [SmartCache] Invalidated permission cache`)
  },

  /**
   * Invalidate notification cache when new notifications arrive
   */
  onNotificationUpdate: (userId: string) => {
    smartCache.delete(cacheKeys.notifications(userId))
    smartCache.invalidateByTags(["notifications"])
    console.log(`🗑️ [SmartCache] Invalidated notification cache`)
  },
}

/**
 * Cache warming strategies
 */
export const cacheWarming = {
  /**
   * Warm cache with essential data after login
   */
  afterLogin: async (
    userId: string,
    companyId: string,
    dataFetchers: {
      getCompanies: () => Promise<unknown[]>
      getPermissions: () => Promise<unknown[]>
      getDecimals: () => Promise<unknown[]>
    }
  ) => {
    console.log(`🔥 [SmartCache] Warming cache after login...`)

    try {
      // Warm companies cache
      await withCache(
        cacheKeys.companies(userId),
        CACHE_CONFIG.companies,
        dataFetchers.getCompanies
      )

      // Warm permissions cache
      await withCache(
        cacheKeys.permissions(userId, companyId),
        CACHE_CONFIG.permissions,
        dataFetchers.getPermissions
      )

      // Warm decimals cache
      await withCache(
        cacheKeys.decimals(companyId),
        CACHE_CONFIG.decimals,
        dataFetchers.getDecimals
      )

      console.log(`✅ [SmartCache] Cache warmed successfully`)
    } catch (error) {
      console.error(`❌ [SmartCache] Cache warming failed:`, error)
    }
  },

  /**
   * Prefetch related data when user navigates
   */
  onNavigation: async (userId: string, companyId: string, route: string) => {
    console.log(`🔥 [SmartCache] Prefetching data for route: ${route}`)

    // Add route-specific prefetching logic here
    // For example, if user navigates to notifications, prefetch notifications
    if (route.includes("notifications")) {
      // This would be implemented with actual notification fetching
      console.log(
        `🔥 [SmartCache] Would prefetch notifications for user: ${userId}`
      )
    }
  },
}

/**
 * Cache monitoring and debugging
 */
export const cacheMonitor = {
  /**
   * Log cache statistics
   */
  logStats: () => {
    const stats = smartCache.getStats()
    console.log("📊 [SmartCache] Cache Statistics:", stats)
    return stats
  },

  /**
   * Debug cache contents
   */
  debugCache: () => {
    console.log("🔍 [SmartCache] Cache Contents:", smartCache)
  },

  /**
   * Clear all cache (for debugging)
   */
  clearAll: () => {
    smartCache.clear()
    console.log("🗑️ [SmartCache] All cache cleared for debugging")
  },
}
