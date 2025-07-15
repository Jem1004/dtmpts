// Comprehensive caching system
import { env } from './env';
import logger from './logger';
import performanceMonitor from './performance';

// Cache configuration
interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  checkPeriod: number; // Cleanup check period in milliseconds
  enableStats: boolean;
  enableCompression: boolean;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  checkPeriod: 60 * 1000, // 1 minute
  enableStats: true,
  enableCompression: false,
};

// Cache item interface
interface CacheItem<T> {
  value: T;
  expiry: number;
  hits: number;
  lastAccessed: number;
  size: number;
  compressed?: boolean;
}

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number;
  memoryUsage: number;
}

// In-memory cache implementation
class MemoryCache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      memoryUsage: 0,
    };

    this.startCleanup();
  }

  // Get item from cache
  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateSize();
      return null;
    }

    // Update access statistics
    item.hits++;
    item.lastAccessed = Date.now();
    this.stats.hits++;

    return item.value;
  }

  // Set item in cache
  set(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.config.defaultTTL);
    const size = this.calculateSize(value);

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const item: CacheItem<T> = {
      value,
      expiry,
      hits: 0,
      lastAccessed: Date.now(),
      size,
    };

    this.cache.set(key, item);
    this.stats.sets++;
    this.updateSize();
  }

  // Delete item from cache
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.updateSize();
    }
    return deleted;
  }

  // Check if key exists
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.updateSize();
      return false;
    }

    return true;
  }

  // Clear all items
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.memoryUsage = 0;
  }

  // Get all keys
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Reset statistics
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: this.cache.size,
      memoryUsage: this.stats.memoryUsage,
    };
  }

  // Get hit ratio
  getHitRatio(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  // Evict least recently used item
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.updateSize();
    }
  }

  // Calculate size of value
  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  // Update cache size statistics
  private updateSize(): void {
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = Array.from(this.cache.values())
      .reduce((total, item) => total + item.size, 0);
  }

  // Start cleanup timer
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.checkPeriod);
  }

  // Cleanup expired items
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });

    if (expiredKeys.length > 0) {
      this.updateSize();
      logger.debug(`Cache cleanup: removed ${expiredKeys.length} expired items`);
    }
  }

  // Destroy cache
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// Cache manager for multiple cache instances
class CacheManager {
  private caches = new Map<string, MemoryCache>();
  private defaultCache: MemoryCache;

  constructor() {
    this.defaultCache = new MemoryCache();
  }

  // Get or create cache instance
  getCache(name: string = 'default'): MemoryCache {
    if (name === 'default') {
      return this.defaultCache;
    }

    if (!this.caches.has(name)) {
      this.caches.set(name, new MemoryCache());
    }

    return this.caches.get(name)!;
  }

  // Create cache with custom config
  createCache(name: string, config: Partial<CacheConfig>): MemoryCache {
    const cache = new MemoryCache(config);
    this.caches.set(name, cache);
    return cache;
  }

  // Delete cache instance
  deleteCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.destroy();
      return this.caches.delete(name);
    }
    return false;
  }

  // Get all cache names
  getCacheNames(): string[] {
    return ['default', ...Array.from(this.caches.keys())];
  }

  // Get combined statistics
  getAllStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {
      default: this.defaultCache.getStats(),
    };

    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }

    return stats;
  }

  // Clear all caches
  clearAll(): void {
    this.defaultCache.clear();
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  // Destroy all caches
  destroyAll(): void {
    this.defaultCache.destroy();
    for (const cache of this.caches.values()) {
      cache.destroy();
    }
    this.caches.clear();
  }
}

// Global cache manager instance
const cacheManager = new CacheManager();

// Cache decorators and utilities

// Memoization decorator
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
    cacheName?: string;
  } = {}
): T {
  const cache = cacheManager.getCache(options.cacheName);
  const keyGenerator = options.keyGenerator || ((...args) => JSON.stringify(args));

  return ((...args: Parameters<T>) => {
    const key = `memoize:${fn.name}:${keyGenerator(...args)}`;
    
    let result = cache.get(key);
    if (result !== null) {
      return result;
    }

    const startTime = performance.now();
    result = fn(...args);
    const endTime = performance.now();

    cache.set(key, result, options.ttl);
    
    performanceMonitor.recordMetric(`cache_miss_${fn.name}`, endTime - startTime);
    
    return result;
  }) as T;
}

// Async memoization
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
    cacheName?: string;
  } = {}
): T {
  const cache = cacheManager.getCache(options.cacheName);
  const keyGenerator = options.keyGenerator || ((...args) => JSON.stringify(args));
  const pendingPromises = new Map<string, Promise<any>>();

  return (async (...args: Parameters<T>) => {
    const key = `memoize_async:${fn.name}:${keyGenerator(...args)}`;
    
    // Check cache first
    let result = cache.get(key);
    if (result !== null) {
      return result;
    }

    // Check if promise is already pending
    if (pendingPromises.has(key)) {
      return pendingPromises.get(key);
    }

    // Execute function and cache result
    const startTime = performance.now();
    const promise = fn(...args).then(result => {
      const endTime = performance.now();
      cache.set(key, result, options.ttl);
      pendingPromises.delete(key);
      
      performanceMonitor.recordMetric(`cache_miss_async_${fn.name}`, endTime - startTime);
      
      return result;
    }).catch(error => {
      pendingPromises.delete(key);
      throw error;
    });

    pendingPromises.set(key, promise);
    return promise;
  }) as T;
}

// Cache-aside pattern helper
export class CacheAside<T> {
  private cache: MemoryCache<T>;
  private loader: (key: string) => Promise<T>;
  private ttl: number;

  constructor(
    loader: (key: string) => Promise<T>,
    options: {
      ttl?: number;
      cacheName?: string;
      cacheConfig?: Partial<CacheConfig>;
    } = {}
  ) {
    this.cache = options.cacheName 
      ? cacheManager.getCache(options.cacheName)
      : new MemoryCache(options.cacheConfig);
    this.loader = loader;
    this.ttl = options.ttl || DEFAULT_CONFIG.defaultTTL;
  }

  async get(key: string): Promise<T> {
    // Try cache first
    let value = this.cache.get(key);
    if (value !== null) {
      return value;
    }

    // Load from source
    const startTime = performance.now();
    value = await this.loader(key);
    const endTime = performance.now();

    // Cache the result
    this.cache.set(key, value, this.ttl);
    
    performanceMonitor.recordMetric('cache_aside_load', endTime - startTime);
    
    return value;
  }

  set(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, ttl || this.ttl);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Write-through cache helper
export class WriteThrough<T> {
  private cache: MemoryCache<T>;
  private writer: (key: string, value: T) => Promise<void>;
  private loader: (key: string) => Promise<T>;
  private ttl: number;

  constructor(
    loader: (key: string) => Promise<T>,
    writer: (key: string, value: T) => Promise<void>,
    options: {
      ttl?: number;
      cacheName?: string;
      cacheConfig?: Partial<CacheConfig>;
    } = {}
  ) {
    this.cache = options.cacheName 
      ? cacheManager.getCache(options.cacheName)
      : new MemoryCache(options.cacheConfig);
    this.loader = loader;
    this.writer = writer;
    this.ttl = options.ttl || DEFAULT_CONFIG.defaultTTL;
  }

  async get(key: string): Promise<T> {
    let value = this.cache.get(key);
    if (value !== null) {
      return value;
    }

    value = await this.loader(key);
    this.cache.set(key, value, this.ttl);
    
    return value;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    // Write to both cache and storage
    await this.writer(key, value);
    this.cache.set(key, value, ttl || this.ttl);
  }

  async delete(key: string): Promise<boolean> {
    // Delete from both cache and storage
    try {
      await this.writer(key, null as any); // Assuming null means delete
      return this.cache.delete(key);
    } catch (error) {
      logger.error('Write-through delete failed', { key }, error);
      return false;
    }
  }
}

// React hook for caching
export function useCache<T>(cacheName?: string) {
  const cache = cacheManager.getCache(cacheName);

  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: T, ttl?: number) => cache.set(key, value, ttl),
    delete: (key: string) => cache.delete(key),
    has: (key: string) => cache.has(key),
    clear: () => cache.clear(),
    stats: () => cache.getStats(),
  };
}

// Cache warming utilities
export const cacheWarming = {
  // Warm cache with data
  async warmCache<T>(
    keys: string[],
    loader: (key: string) => Promise<T>,
    cacheName?: string,
    ttl?: number
  ): Promise<void> {
    const cache = cacheManager.getCache(cacheName);
    const promises = keys.map(async (key) => {
      try {
        const value = await loader(key);
        cache.set(key, value, ttl);
      } catch (error) {
        logger.warn(`Cache warming failed for key: ${key}`, {}, error);
      }
    });

    await Promise.allSettled(promises);
    logger.info(`Cache warming completed for ${keys.length} keys`);
  },

  // Warm cache in background
  warmCacheBackground<T>(
    keys: string[],
    loader: (key: string) => Promise<T>,
    cacheName?: string,
    ttl?: number
  ): void {
    this.warmCache(keys, loader, cacheName, ttl).catch(error => {
      logger.error('Background cache warming failed', {}, error);
    });
  },
};

// Export cache manager and utilities
export {
  MemoryCache,
  CacheManager,
  cacheManager,
  type CacheConfig,
  type CacheStats,
  type CacheItem,
};

// Export default cache instance
export default cacheManager.getCache();