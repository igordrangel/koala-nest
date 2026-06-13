import { describe, expect, it } from 'bun:test';
import { RedisCacheService } from '@/infra/common/redis-cache.service';
import type Redis from 'ioredis';

class RedisStub {
  readonly store = new Map<string, string>();

  get(key: string) {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  set(key: string, value: string, ...args: unknown[]) {
    const hasNx = args.includes('NX');

    if (hasNx && this.store.has(key)) {
      return Promise.resolve(null);
    }

    this.store.set(key, value);
    return Promise.resolve('OK');
  }

  del(...keys: string[]) {
    for (const key of keys) {
      this.store.delete(key);
    }

    return Promise.resolve(keys.length);
  }

  keys(pattern: string) {
    const prefix = pattern.replace(/\*$/, '');
    return Promise.resolve(
      [...this.store.keys()].filter((key) => key.startsWith(prefix)),
    );
  }

  disconnect() {}
}

describe('RedisCacheService', () => {
  it('prefixa chaves ao gravar e ler', async () => {
    const stub = new RedisStub();
    const cache = new RedisCacheService(
      'redis://localhost:6379',
      'koala-nest',
      stub as unknown as Redis,
    );

    await cache.set('session:1', 'token');

    expect(stub.store.get('koala-nest:session:1')).toBe('token');
    expect(await cache.get('session:1')).toBe('token');
  });

  it('remove chaves com invalidate', async () => {
    const stub = new RedisStub();
    const cache = new RedisCacheService(
      'redis://localhost:6379',
      'koala-nest',
      stub as unknown as Redis,
    );

    await cache.set('session:1', 'token');
    await cache.invalidate('session:1');

    expect(await cache.get('session:1')).toBeNull();
  });

  it('remove chaves por prefixo com invalidateByPrefix', async () => {
    const stub = new RedisStub();
    const cache = new RedisCacheService(
      'redis://localhost:6379',
      'koala-nest',
      stub as unknown as Redis,
    );

    await cache.set('person:list:{"page":0}', 'a');
    await cache.set('person:list:{"page":1}', 'b');
    await cache.set('session:1', 'token');
    await cache.invalidateByPrefix('person:list');

    expect(await cache.get('person:list:{"page":0}')).toBeNull();
    expect(await cache.get('person:list:{"page":1}')).toBeNull();
    expect(await cache.get('session:1')).toBe('token');
  });

  it('setIfNotExists grava somente quando a chave não existe', async () => {
    const stub = new RedisStub();
    const cache = new RedisCacheService(
      'redis://localhost:6379',
      'koala-nest',
      stub as unknown as Redis,
    );

    expect(await cache.setIfNotExists('lock:job', 'held', 60)).toBe(true);
    expect(await cache.setIfNotExists('lock:job', 'held', 60)).toBe(false);
    expect(await cache.get('lock:job')).toBe('held');
  });
});
