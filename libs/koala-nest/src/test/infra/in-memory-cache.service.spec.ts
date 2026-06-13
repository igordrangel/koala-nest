import { describe, expect, it } from 'bun:test';
import { InMemoryCacheService } from '@/infra/common/in-memory-cache.service';

describe('InMemoryCacheService', () => {
  it('armazena e recupera valores', async () => {
    const cache = new InMemoryCacheService();

    await cache.set('key', 'value');

    expect(await cache.get('key')).toBe('value');
  });

  it('expira entradas após o TTL', async () => {
    const cache = new InMemoryCacheService();

    await cache.set('key', 'value', -1);

    expect(await cache.get('key')).toBeNull();
  });

  it('remove entradas com invalidate', async () => {
    const cache = new InMemoryCacheService();

    await cache.set('key', 'value');
    await cache.invalidate('key');

    expect(await cache.get('key')).toBeNull();
  });

  it('remove entradas por prefixo com invalidateByPrefix', async () => {
    const cache = new InMemoryCacheService();

    await cache.set('person:list:{"page":0}', 'a');
    await cache.set('person:list:{"page":1}', 'b');
    await cache.set('session:1', 'token');
    await cache.invalidateByPrefix('person:list');

    expect(await cache.get('person:list:{"page":0}')).toBeNull();
    expect(await cache.get('person:list:{"page":1}')).toBeNull();
    expect(await cache.get('session:1')).toBe('token');
  });

  it('setIfNotExists grava somente quando a chave não existe', async () => {
    const cache = new InMemoryCacheService();

    expect(await cache.setIfNotExists('lock:job', 'held', 60)).toBe(true);
    expect(await cache.setIfNotExists('lock:job', 'held', 60)).toBe(false);
  });
});
