import { describe, expect, it } from 'bun:test';
import { buildListCacheKey } from '@/core/utils/build-list-cache-key';

describe('buildListCacheKey', () => {
  it('monta chave estável a partir dos filtros da listagem', () => {
    const key = buildListCacheKey('person:list', {
      page: 0,
      limit: 10,
      name: 'Jane',
      active: true,
    });

    expect(key).toBe(
      'person:list:{"active":true,"limit":10,"name":"Jane","page":0}',
    );
  });

  it('ignora métodos e filtros vazios ou nulos', () => {
    const key = buildListCacheKey('person:list', {
      page: 0,
      name: undefined,
      active: null,
      orderBy: '',
      skip: () => 0,
    });

    expect(key).toBe('person:list:{"page":0}');
  });
});
