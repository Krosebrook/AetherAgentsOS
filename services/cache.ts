/**
 * LRU Cache Implementation for AI Response Caching
 * Provides intelligent caching with TTL support and metrics
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
  size: number; // Approximate size in bytes
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  currentSize: number;
  maxSize: number;
}

// Constants for cache calculations
const BYTES_PER_KB = 1024;

export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds
  private currentSize: number = 0;
  private metrics: CacheMetrics;

  constructor(maxSize: number = 100, ttlMinutes: number = 30) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      currentSize: 0,
      maxSize
    };
  }

  /**
   * Generate a cache key from prompt and config
   */
  static generateKey(prompt: string, config: Record<string, unknown>): string {
    const configStr = JSON.stringify(config, Object.keys(config).sort());
    return `${prompt}:${configStr}`;
  }

  /**
   * Get value from cache if not expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      this.metrics.misses++;
      this.metrics.evictions++;
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    entry.hits++;
    this.cache.set(key, entry);
    this.metrics.hits++;
    
    return entry.value;
  }

  /**
   * Set value in cache with size estimation
   */
  set(key: string, value: T): void {
    // Estimate size (rough approximation)
    const size = JSON.stringify(value).length;

    // If adding this would exceed max size, evict oldest entries
    while (this.currentSize + size > this.maxSize * BYTES_PER_KB && this.cache.size > 0) {
      const oldestKey = this.cache.keys().next().value;
      const oldEntry = this.cache.get(oldestKey);
      if (oldEntry) {
        this.currentSize -= oldEntry.size;
      }
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
    }

    // Remove existing entry if present
    const existing = this.cache.get(key);
    if (existing) {
      this.currentSize -= existing.size;
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      hits: 0,
      size
    };

    this.cache.set(key, entry);
    this.currentSize += size;
    this.metrics.currentSize = this.currentSize;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      currentSize: 0,
      maxSize: this.maxSize
    };
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total === 0 ? 0 : this.metrics.hits / total;
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance for AI response caching
export const aiResponseCache = new LRUCache<unknown>(50, 30); // 50MB, 30 minutes TTL
