import { describe, expect, it } from 'bun:test';
import { RedLockService } from '@/infra/common/red-lock.service';
import { EnvService } from '@/infra/common/env.service';
import { CacheStub } from '@/test/services/cache.stub';

function createEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    get: (key: string) => overrides[key],
  } as unknown as EnvService;
}

describe('RedLockService', () => {
  it('adquire lock distribuído apenas na primeira instância', async () => {
    const cache = new CacheStub();
    const service = new RedLockService(
      cache,
      createEnv({ REDIS_CONNECTION_STRING: 'redis://localhost:6379' }),
    );

    expect(await service.acquiredLock('job:create-person', 60)).toBe(true);
    expect(await service.acquiredLock('job:create-person', 60)).toBe(false);
  });

  it('libera o lock para permitir nova execução', async () => {
    const cache = new CacheStub();
    const service = new RedLockService(
      cache,
      createEnv({ REDIS_CONNECTION_STRING: 'redis://localhost:6379' }),
    );

    expect(await service.acquiredLock('job:create-person', 60)).toBe(true);
    await service.releaseLock('job:create-person');
    expect(await service.acquiredLock('job:create-person', 60)).toBe(true);
  });

  it('ignora lock em test ou sem Redis configurado', async () => {
    const cache = new CacheStub();
    const service = new RedLockService(cache, createEnv({ NODE_ENV: 'test' }));

    expect(await service.acquiredLock('job:create-person', 60)).toBe(true);
    expect(await service.acquiredLock('job:create-person', 60)).toBe(true);
  });
});
