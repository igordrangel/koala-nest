import { describe, expect, it } from 'bun:test';
import { InactivePersonHandler } from '@/application/person/jobs/events/person/inactive-person/inactive-person.handler';
import { InactivePersonEvent } from '@/application/person/jobs/events/person/inactive-person/inactive-person.event';
import { Person } from '@/domain/entities/person/person';
import { PersonAddress } from '@/domain/entities/person/person-address';
import { PERSON_LIST_CACHE_PREFIX } from '@/core/utils/person-list-cache';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { CacheStub } from '@/test/services/cache.stub';

describe('InactivePersonHandler', () => {
  it('inativa todas as pessoas ativas e invalida cache', async () => {
    const cache = new CacheStub();
    const activePerson = Person.from({
      id: 1,
      name: 'Jane',
      active: true,
      address: PersonAddress.from({ id: 1, address: 'Street' }),
      contacts: [],
    });

    const calls = {
      findMany: [] as Parameters<IPersonRepository['findMany']>,
      save: [] as Person[],
    };

    const repository = {
      findMany: async (query: Parameters<IPersonRepository['findMany']>[0]) => {
        calls.findMany.push(query);
        return { items: [activePerson], count: 1 };
      },
      findById: async () => null,
      save: async (person: Person) => {
        calls.save.push(person);
        return person;
      },
      delete: async () => undefined,
    } as unknown as IPersonRepository;

    const handler = new InactivePersonHandler(repository, cache);

    await handler.handleEvent(new InactivePersonEvent());

    expect(calls.findMany[0]?.active).toBe(true);
    expect(activePerson.active).toBe(false);
    expect(calls.save).toEqual([activePerson]);
    expect(cache.invalidateByPrefixCalls).toEqual([PERSON_LIST_CACHE_PREFIX]);
  });
});
