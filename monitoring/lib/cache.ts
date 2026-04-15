// Simple in-memory cache for API responses
type CacheEntry<T> = {
  data: T
  timestamp: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 5000 // 5 seconds default

  /**
   * Get cached data if still valid
   */
  get<T>(key: string, ttl?: number): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const maxAge = ttl || this.defaultTTL
    const age = Date.now() - entry.timestamp

    if (age > maxAge) {
      // Expired - remove from cache
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set cache data
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Clear specific key or all cache
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Clean expired entries
   */
  cleanup(ttl?: number): void {
    const maxAge = ttl || this.defaultTTL
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key)
      }
    }
  }
}

// Export singleton instance
export const cache = new SimpleCache()

// Auto cleanup every 30 seconds
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup(30000) // Clean entries older than 30s
  }, 30000)
}
