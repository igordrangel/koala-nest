import { describe, expect, it } from 'bun:test';
import { ICacheService } from '@/domain/common/icache.service';
import { RedLockService } from '@/infra/common/red-lock.service';
import { EnvService } from '@/infra/common/env.service';

class CacheStub implements ICacheService {
  readonly store = new Map<string, string>();

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }

  async setIfNotExists(
    key: string,
    value: string,
    _ttl: number,
  ): Promise<boolean> {
    if (this.store.has(key)) {
      return false;
    }

    this.store.set(key, value);
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

function createEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    get: (key: string) => overrides[key],
  } as unknown as EnvService;
}

describe('RedLockService', () => {
  it('adquire lock distribuído apenas na primeira instância', async () => {
    const cache = new CacheStub();
    const lock = new RedLockService(
      cache,
      createEnv({ REDIS_CONNECTION_STRING: 'redis://localhost:6379' }),
    );

    expect(await lock.acquiredLock('DeleteInactiveJob', 60)).toBe(true);
    expect(await lock.acquiredLock('DeleteInactiveJob', 60)).toBe(false);
  });

  it('libera o lock para permitir nova execução', async () => {
    const cache = new CacheStub();
    const lock = new RedLockService(
      cache,
      createEnv({ REDIS_CONNECTION_STRING: 'redis://localhost:6379' }),
    );

    expect(await lock.acquiredLock('DeleteInactiveJob', 60)).toBe(true);
    await lock.releaseLock('DeleteInactiveJob');
    expect(await lock.acquiredLock('DeleteInactiveJob', 60)).toBe(true);
  });

  it('ignora lock em test ou sem Redis configurado', async () => {
    const cache = new CacheStub();
    const lockWithoutRedis = new RedLockService(cache, createEnv());
    const lockInTest = new RedLockService(
      cache,
      createEnv({ NODE_ENV: 'test' }),
    );

    expect(await lockWithoutRedis.acquiredLock('DeleteInactiveJob', 60)).toBe(
      true,
    );
    expect(await lockInTest.acquiredLock('DeleteInactiveJob', 60)).toBe(true);
    expect(cache.store.size).toBe(0);
  });
});
