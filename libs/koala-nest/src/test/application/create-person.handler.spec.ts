import { describe, expect, it, beforeAll } from 'bun:test';
import { CreatePersonHandler } from '@/application/person/create/create-person.handler';
import { PersonMapper } from '@/application/mapping/person.mapper';
import { Person } from '@/domain/entities/person/person';
import { PERSON_LIST_CACHE_PREFIX } from '@/core/utils/person-list-cache';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { CacheStub } from '@/test/services/cache.stub';

describe('CreatePersonHandler', () => {
  beforeAll(() => {
    PersonMapper.createMap();
  });

  it('valida, persiste, invalida cache e retorna o id da pessoa criada', async () => {
    const saved: Person[] = [];
    const cache = new CacheStub();

    const repository = {
      save: async (person: Person) => {
        const created = Person.from({ ...person, id: 42 });
        saved.push(created);
        return created;
      },
    } as unknown as IPersonRepository;

    const handler = new CreatePersonHandler(repository, cache);

    const result = await handler.handle({
      name: 'John Doe',
      address: { address: 'Street 1' },
      contacts: [{ contact: 'john@example.com' }],
    });

    expect(result.id).toBe(42);
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('John Doe');
    expect(cache.invalidateByPrefixCalls).toEqual([PERSON_LIST_CACHE_PREFIX]);
  });
});
