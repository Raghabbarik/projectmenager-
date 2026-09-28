import { getRemoteRedisClient, isRedisRemoteConfigured, resetRemoteRedisClient } from '../lib/redis';

export interface RedisCacheStats {
  status: 'connected' | 'fallback';
  provider: 'upstash-redis' | 'local-redis-simulator';
  hits: number;
  misses: number;
  keysCount: number;
  lastPingMs: number;
}

export interface ActiveMemberPresence {
  email: string;
  name: string;
  role: string;
  lastSeen: number;
}

// In-Memory & LocalStorage High-Speed Fallback Store
interface CacheEntry {
  value: any;
  expiresAt: number | null; // null = persistent
  createdAt: number;
}

class LocalRedisSimulator {
  private memory = new Map<string, CacheEntry>();
  private storageKey = 'my_journey_simulated_redis';

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        const now = Date.now();
        for (const [k, v] of Object.entries(parsed)) {
          const entry = v as CacheEntry;
          if (!entry.expiresAt || entry.expiresAt > now) {
            this.memory.set(k, entry);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, CacheEntry> = {};
      const now = Date.now();
      this.memory.forEach((entry, k) => {
        if (!entry.expiresAt || entry.expiresAt > now) {
          obj[k] = entry;
        }
      });
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch {
      // ignore
    }
  }

  get<T>(key: string): T | null {
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.memory.delete(key);
      this.persist();
      return null;
    }
    return entry.value as T;
  }

  set(key: string, value: any, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memory.set(key, { value, expiresAt, createdAt: Date.now() });
    this.persist();
  }

  del(key: string): void {
    this.memory.delete(key);
    this.persist();
  }

  keys(pattern: string = '*'): string[] {
    const now = Date.now();
    const result: string[] = [];
    this.memory.forEach((entry, key) => {
      if (!entry.expiresAt || entry.expiresAt > now) {
        if (pattern === '*' || key.includes(pattern.replace(/\*/g, ''))) {
          result.push(key);
        }
      } else {
        this.memory.delete(key);
      }
    });
    return result;
  }

  flush(): void {
    this.memory.clear();
    this.persist();
  }
}

class RedisService {
  private local = new LocalRedisSimulator();
  private stats: RedisCacheStats = {
    status: 'fallback',
    provider: 'local-redis-simulator',
    hits: 0,
    misses: 0,
    keysCount: 0,
    lastPingMs: 0,
  };

  constructor() {
    this.updateStats();
  }

  private updateStats() {
    const isRemote = isRedisRemoteConfigured();
    this.stats.status = isRemote ? 'connected' : 'fallback';
    this.stats.provider = isRemote ? 'upstash-redis' : 'local-redis-simulator';
    this.stats.keysCount = this.local.keys().length;
  }

  /**
   * Ping Redis to test connectivity and measure latency
   */
  async ping(): Promise<{ ok: boolean; latencyMs: number; message: string }> {
    const client = getRemoteRedisClient();
    const start = performance.now();

    if (client) {
      try {
        const res = await client.ping();
        const latency = Math.round(performance.now() - start);
        this.stats.lastPingMs = latency;
        this.stats.status = 'connected';
        return { ok: true, latencyMs: latency, message: `Upstash Redis PONG (${res}) in ${latency}ms` };
      } catch (err: any) {
        const latency = Math.round(performance.now() - start);
        this.stats.status = 'fallback';
        return { ok: false, latencyMs: latency, message: `Redis connection error: ${err?.message || 'Failed'}` };
      }
    } else {
      // Local simulated response
      const latency = Math.round(performance.now() - start) + 1;
      this.stats.lastPingMs = latency;
      return { ok: true, latencyMs: latency, message: `Simulated Centralized Redis Cache active (Latency: ${latency}ms)` };
    }
  }

  /**
   * GET key from Redis cache
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRemoteRedisClient();

    if (client) {
      try {
        const val = await client.get<T>(key);
        if (val !== null && val !== undefined) {
          this.stats.hits++;
          return val;
        } else {
          this.stats.misses++;
          return null;
        }
      } catch (err) {
        console.warn(`Redis GET ${key} failed, falling back:`, err);
      }
    }

    // Fallback store
    const localVal = this.local.get<T>(key);
    if (localVal !== null && localVal !== undefined) {
      this.stats.hits++;
      return localVal;
    }
    this.stats.misses++;
    return null;
  }

  /**
   * SET key in Redis with optional TTL in seconds
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const client = getRemoteRedisClient();

    // Always mirror to local store for offline/fast read
    this.local.set(key, value, ttlSeconds);
    this.stats.keysCount = this.local.keys().length;

    if (client) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await client.set(key, value, { ex: ttlSeconds });
        } else {
          await client.set(key, value);
        }
        return true;
      } catch (err) {
        console.warn(`Redis SET ${key} failed:`, err);
        return false;
      }
    }

    return true;
  }

  /**
   * DEL key from Redis
   */
  async del(key: string): Promise<boolean> {
    this.local.del(key);
    this.stats.keysCount = this.local.keys().length;

    const client = getRemoteRedisClient();
    if (client) {
      try {
        await client.del(key);
        return true;
      } catch (err) {
        console.warn(`Redis DEL ${key} failed:`, err);
        return false;
      }
    }
    return true;
  }

  /**
   * KEYS pattern match
   */
  async keys(pattern: string = '*'): Promise<string[]> {
    const client = getRemoteRedisClient();
    if (client) {
      try {
        const remoteKeys = await client.keys(pattern);
        if (Array.isArray(remoteKeys)) {
          return remoteKeys;
        }
      } catch (err) {
        console.warn('Redis KEYS failed:', err);
      }
    }
    return this.local.keys(pattern);
  }

  /**
   * FLUSH all application cache keys
   */
  async flushAll(): Promise<boolean> {
    this.local.flush();
    this.stats.keysCount = 0;

    const client = getRemoteRedisClient();
    if (client) {
      try {
        await client.flushdb();
        return true;
      } catch (err) {
        console.warn('Redis flushdb failed:', err);
        return false;
      }
    }
    return true;
  }

  /**
   * Update configuration credentials dynamically from UI
   */
  updateConfig(url: string, token: string): void {
    resetRemoteRedisClient(url, token);
    this.updateStats();
  }

  getStats(): RedisCacheStats {
    const isRemote = isRedisRemoteConfigured();
    return {
      ...this.stats,
      status: isRemote ? 'connected' : 'fallback',
      provider: isRemote ? 'upstash-redis' : 'local-redis-simulator',
      keysCount: this.local.keys().length,
    };
  }

  // ============================================================================
  // High-Level Centralized Application Cache Helpers
  // ============================================================================

  /**
   * Cache public website content with 1-hour TTL
   */
  async cachePublicContent(data: any): Promise<void> {
    await this.set('cache:public_site', data, 3600);
  }

  async getCachedPublicContent(): Promise<any | null> {
    return this.get<any>('cache:public_site');
  }

  /**
   * Cache timeline milestones
   */
  async cacheMilestones(scope: string, milestones: any[]): Promise<void> {
    await this.set(`cache:milestones:${scope}`, milestones, 1800);
  }

  async getCachedMilestones(scope: string): Promise<any[] | null> {
    return this.get<any[]>(`cache:milestones:${scope}`);
  }

  /**
   * Cache ideas vault
   */
  async cacheIdeas(ideas: any[]): Promise<void> {
    await this.set('cache:ideas_vault', ideas, 1800);
  }

  async getCachedIdeas(): Promise<any[] | null> {
    return this.get<any[]>('cache:ideas_vault');
  }

  /**
   * Real-time Team Member Presence via Redis Heartbeat
   * Keys expire after 2 minutes of inactivity.
   */
  async sendMemberHeartbeat(email: string, name: string, role: string): Promise<void> {
    const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const presence: ActiveMemberPresence = {
      email,
      name,
      role,
      lastSeen: Date.now(),
    };
    // 120s TTL for presence
    await this.set(`presence:member:${cleanEmail}`, presence, 120);
  }

  async getOnlineMembers(): Promise<ActiveMemberPresence[]> {
    const keys = await this.keys('presence:member:*');
    const members: ActiveMemberPresence[] = [];

    for (const key of keys) {
      const data = await this.get<ActiveMemberPresence>(key);
      if (data && Date.now() - data.lastSeen < 120000) {
        members.push(data);
      }
    }
    return members;
  }
}

export const redisService = new RedisService();
