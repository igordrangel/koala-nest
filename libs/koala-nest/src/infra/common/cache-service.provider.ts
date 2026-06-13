import { KoalaGlobalVars } from '@/core/koala-global-vars';
import { ICacheService } from '@/domain/common/icache.service';
import { EnvService } from '@/infra/common/env.service';
import { InMemoryCacheService } from '@/infra/common/in-memory-cache.service';
import { RedisCacheService } from '@/infra/common/redis-cache.service';
import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class CacheServiceProvider implements ICacheService, OnModuleDestroy {
  private readonly delegate: ICacheService & Partial<OnModuleDestroy>;

  constructor(env: EnvService) {
    const redisUrl = env.get('REDIS_CONNECTION_STRING');

    this.delegate = redisUrl
      ? new RedisCacheService(redisUrl, this.resolveKeyPrefix(env))
      : new InMemoryCacheService();
  }

  get(key: string): Promise<string | null> {
    return this.delegate.get(key);
  }

  set(key: string, value: string, ttl?: number): Promise<void> {
    return this.delegate.set(key, value, ttl);
  }

  setIfNotExists(key: string, value: string, ttl: number): Promise<boolean> {
    return this.delegate.setIfNotExists(key, value, ttl);
  }

  invalidate(key: string): Promise<void> {
    return this.delegate.invalidate(key);
  }

  invalidateByPrefix(prefix: string): Promise<void> {
    return this.delegate.invalidateByPrefix(prefix);
  }

  onModuleDestroy() {
    this.delegate.onModuleDestroy?.();
  }

  private resolveKeyPrefix(env: EnvService) {
    return env.get('CACHE_KEY_PREFIX') ?? KoalaGlobalVars.appName;
  }
}
