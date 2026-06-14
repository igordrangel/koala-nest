import { describe, expect, it, beforeAll } from 'bun:test';
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler';
import { ReadManyPersonRequest } from '@/application/person/read-many/read-many-person.request';
import { PersonMapper } from '@/application/mapping/person.mapper';
import { Person } from '@/domain/entities/person/person';
import { PersonAddress } from '@/domain/entities/person/person-address';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { CacheStub } from '@/test/services/cache.stub';

describe('ReadManyPersonHandler', () => {
  beforeAll(() => {
    PersonMapper.createMap();
  });

  it('lista pessoas com paginação mapeada', async () => {
    const person = Person.from({
      id: 1,
      name: 'Jane',
      active: true,
      address: PersonAddress.from({ id: 2, address: 'Street' }),
      contacts: [],
    });

    let capturedPage: number | undefined;
    const repository = {
      findMany: async (query: { page?: number; skip: () => number }) => {
        capturedPage = query.page;
        return { items: [person], count: 1 };
      },
    } as unknown as IPersonRepository;

    const handler = new ReadManyPersonHandler(repository, new CacheStub());
    const result = await handler.handle({ page: '2', limit: '5' } as never);

    expect(capturedPage).toBe(1);
    expect(result.count).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Jane');
  });

  it('preserva paginação ao receber instância de ReadManyPersonRequest', async () => {
    let capturedPage: number | undefined;
    const repository = {
      findMany: async (query: { page?: number }) => {
        capturedPage = query.page;
        return { items: [], count: 0 };
      },
    } as unknown as IPersonRepository;

    const handler = new ReadManyPersonHandler(repository, new CacheStub());
    const request = Object.assign(new ReadManyPersonRequest(), {
      page: '2',
      limit: '5',
    });

    await handler.handle(request);

    expect(capturedPage).toBe(1);
  });

  it('aplica defaults de paginação quando a request não informa page', async () => {
    let capturedPage: number | undefined;
    const repository = {
      findMany: async (query: { page?: number }) => {
        capturedPage = query.page;
        return { items: [], count: 0 };
      },
    } as unknown as IPersonRepository;

    const handler = new ReadManyPersonHandler(repository, new CacheStub());
    await handler.handle(new ReadManyPersonRequest());

    expect(capturedPage).toBe(0);
  });

  it('reutiliza cache para a mesma consulta de listagem', async () => {
    const person = Person.from({
      id: 1,
      name: 'Jane',
      active: true,
      address: PersonAddress.from({ id: 2, address: 'Street' }),
      contacts: [],
    });

    let calls = 0;
    const repository = {
      findMany: async () => {
        calls += 1;
        return { items: [person], count: 1 };
      },
    } as unknown as IPersonRepository;

    const cache = new CacheStub();
    const handler = new ReadManyPersonHandler(repository, cache);
    const request = new ReadManyPersonRequest();

    await handler.handle(request);
    await handler.handle(request);

    expect(calls).toBe(1);
    expect(cache.store.size).toBe(1);
    expect([...cache.store.keys()][0]).toContain('person:list:');
  });
});
