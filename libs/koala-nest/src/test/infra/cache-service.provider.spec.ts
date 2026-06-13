import { describe, expect, it } from 'bun:test';
import { CacheServiceProvider } from '@/infra/common/cache-service.provider';
import { EnvService } from '@/infra/common/env.service';

function createEnv() {
  return {
    get: () => undefined,
  } as unknown as EnvService;
}

describe('CacheServiceProvider', () => {
  it('delega para cache em memória sem REDIS_CONNECTION_STRING', async () => {
    const provider = new CacheServiceProvider(createEnv());

    await provider.set('key', 'value');
    await provider.invalidate('other');

    expect(await provider.get('key')).toBe('value');
    expect(await provider.get('other')).toBeNull();
  });
});
