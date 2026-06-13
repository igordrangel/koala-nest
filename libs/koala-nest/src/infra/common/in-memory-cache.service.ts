import { ICacheService } from '@/domain/common/icache.service';
import { Injectable } from '@nestjs/common';

type CacheEntry = {
  value: string;
  expiresAt?: number;
};

/**
 * Cache em memória usado quando `REDIS_CONNECTION_STRING` não está configurado.
 */
@Injectable()
export class InMemoryCacheService implements ICacheService {
  private readonly store = new Map<string, CacheEntry>();

  get(key: string): Promise<string | null> {
    const entry = this.store.get(key);

    if (!entry) {
      return Promise.resolve(null);
    }

    if (entry.expiresAt !== undefined && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return Promise.resolve(null);
    }

    return Promise.resolve(entry.value);
  }

  set(key: string, value: string, ttl?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
    });

    return Promise.resolve();
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttl: number,
  ): Promise<boolean> {
    const existing = await this.get(key);

    if (existing) {
      return false;
    }

    await this.set(key, value, ttl);

    return true;
  }

  invalidate(key: string): Promise<void> {
    this.store.delete(key);

    return Promise.resolve();
  }

  invalidateByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }

    return Promise.resolve();
  }
}
