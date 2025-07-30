import { ICacheService, CacheEntry, DataQuality, ServiceHealth, BaseService } from './types';

export class CacheService implements ICacheService {
  public readonly serviceName = 'CacheService';
  
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    lastCleanup: Date.now()
  };
  private health: ServiceHealth = {
    isHealthy: true,
    lastCheck: Date.now(),
    successRate: 1.0,
    totalRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0
  };
  private cleanupInterval?: NodeJS.Timeout;
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;
  private readonly cleanupIntervalMs: number;

  constructor(
    maxSize: number = 1000,
    defaultTtlMs: number = 2 * 60 * 1000, // 2 minutes
    cleanupIntervalMs: number = 5 * 60 * 1000 // 5 minutes
  ) {
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
    this.cleanupIntervalMs = cleanupIntervalMs;
  }

  async initialize(): Promise<void> {
    console.log(`🚀 Initializing ${this.serviceName}...`);
    
    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);

    // Initial cleanup
    this.cleanup();

    this.health.isHealthy = true;
    this.health.lastCheck = Date.now();
    
    console.log(`✅ ${this.serviceName} initialized successfully`);
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const startTime = Date.now();
    this.stats.totalRequests++;
    this.health.totalRequests++;

    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.stats.misses++;
        this.updateHealth(startTime, false);
        return null;
      }

      // Check if entry has expired
      const now = Date.now();
      const age = now - entry.timestamp;
      
      if (age > entry.ttl) {
        // Entry expired, remove it
        this.cache.delete(key);
        this.stats.misses++;
        this.updateHealth(startTime, false);
        return null;
      }

      this.stats.hits++;
      this.updateHealth(startTime, true);
      
      // Update quality based on age
      const updatedEntry = {
        ...entry,
        quality: this.getQualityBasedOnAge(age, entry.quality)
      } as CacheEntry<T>;

      console.log(`📦 Cache HIT for ${key} (age: ${Math.round(age/1000)}s, quality: ${updatedEntry.quality})`);
      return updatedEntry;

    } catch (error) {
      console.error(`❌ Cache get error for ${key}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return null;
    }
  }

  async set<T>(key: string, data: T, quality: DataQuality, ttlMs?: number): Promise<void> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      // Enforce cache size limit
      if (this.cache.size >= this.maxSize) {
        // Remove oldest entries (LRU-style)
        const oldestKeys = Array.from(this.cache.entries())
          .sort(([, a], [, b]) => a.timestamp - b.timestamp)
          .slice(0, Math.floor(this.maxSize * 0.1)) // Remove 10% of entries
          .map(([key]) => key);

        oldestKeys.forEach(oldKey => this.cache.delete(oldKey));
        
        console.log(`🧹 Cache size limit reached, removed ${oldestKeys.length} old entries`);
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        quality,
        ttl: ttlMs || this.defaultTtlMs
      };

      this.cache.set(key, entry);
      this.updateHealth(startTime, true);
      
      console.log(`💾 Cached ${quality} data for ${key} (TTL: ${Math.round((ttlMs || this.defaultTtlMs)/1000)}s)`);

    } catch (error) {
      console.error(`❌ Cache set error for ${key}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      const existed = this.cache.delete(key);
      this.updateHealth(startTime, true);
      
      if (existed) {
        console.log(`🗑️ Deleted cache entry for ${key}`);
      }
      
      return existed;
    } catch (error) {
      console.error(`❌ Cache delete error for ${key}:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      return false;
    }
  }

  async clear(): Promise<void> {
    const startTime = Date.now();
    this.health.totalRequests++;

    try {
      const size = this.cache.size;
      this.cache.clear();
      this.stats = {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        lastCleanup: Date.now()
      };
      
      this.updateHealth(startTime, true);
      console.log(`🧹 Cleared ${size} cache entries`);
    } catch (error) {
      console.error(`❌ Cache clear error:`, error);
      this.health.failedRequests++;
      this.updateHealth(startTime, false);
      throw error;
    }
  }

  async getStats(): Promise<{
    size: number;
    hitRate: number;
    missRate: number;
    totalRequests: number;
  }> {
    const totalCacheRequests = this.stats.hits + this.stats.misses;
    
    return {
      size: this.cache.size,
      hitRate: totalCacheRequests > 0 ? this.stats.hits / totalCacheRequests : 0,
      missRate: totalCacheRequests > 0 ? this.stats.misses / totalCacheRequests : 0,
      totalRequests: totalCacheRequests
    };
  }

  getHealth(): ServiceHealth {
    return { ...this.health };
  }

  async shutdown(): Promise<void> {
    console.log(`🛑 Shutting down ${this.serviceName}...`);
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    
    await this.clear();
    this.health.isHealthy = false;
    
    console.log(`✅ ${this.serviceName} shutdown complete`);
  }

  // Additional utility methods

  /**
   * Get cache keys matching a pattern
   */
  getKeys(pattern?: RegExp): string[] {
    const keys = Array.from(this.cache.keys());
    if (pattern) {
      return keys.filter(key => pattern.test(key));
    }
    return keys;
  }

  /**
   * Get multiple cache entries at once
   */
  async getMultiple<T>(keys: string[]): Promise<Record<string, CacheEntry<T> | null>> {
    const results: Record<string, CacheEntry<T> | null> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.get<T>(key);
      })
    );
    
    return results;
  }

  /**
   * Set multiple cache entries at once
   */
  async setMultiple<T>(entries: Array<{
    key: string;
    data: T;
    quality: DataQuality;
    ttlMs?: number;
  }>): Promise<void> {
    await Promise.all(
      entries.map(async ({ key, data, quality, ttlMs }) => {
        await this.set(key, data, quality, ttlMs);
      })
    );
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get cache entry age in milliseconds
   */
  getAge(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    return Date.now() - entry.timestamp;
  }

  /**
   * Extend TTL of an existing cache entry
   */
  extendTtl(key: string, additionalMs: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    entry.ttl += additionalMs;
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    this.stats.lastCleanup = now;
    
    if (removedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${removedCount} expired entries, ${this.cache.size} entries remaining`);
    }
  }

  private getQualityBasedOnAge(ageMs: number, originalQuality: DataQuality): DataQuality {
    const ageSeconds = ageMs / 1000;
    
    // Degrade quality based on age
    if (ageSeconds < 30) return originalQuality;
    if (ageSeconds < 120) return originalQuality === 'realtime' ? 'cached' : originalQuality;
    if (ageSeconds < 600) return originalQuality === 'realtime' || originalQuality === 'cached' ? 'stale_cache' : originalQuality;
    
    return 'historical';
  }

  private updateHealth(startTime: number, success: boolean): void {
    const responseTime = Date.now() - startTime;
    
    // Update average response time using exponential moving average
    this.health.averageResponseTime = this.health.averageResponseTime * 0.9 + responseTime * 0.1;
    
    // Update success rate
    if (this.health.totalRequests > 0) {
      this.health.successRate = (this.health.totalRequests - this.health.failedRequests) / this.health.totalRequests;
    }
    
    this.health.lastCheck = Date.now();
    this.health.isHealthy = this.health.successRate > 0.8; // Consider healthy if >80% success rate
  }
}