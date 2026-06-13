import { describe, expect, it } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler';
import { Person } from '@/domain/entities/person/person';
import { PERSON_LIST_CACHE_PREFIX } from '@/core/utils/person-list-cache';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { CacheStub } from '@/test/services/cache.stub';

describe('DeletePersonHandler', () => {
  it('remove pessoa existente e invalida cache', async () => {
    const cache = new CacheStub();
    const person = Person.from({
      id: 1,
      name: 'Jane',
      active: true,
      address: undefined,
      contacts: [],
    });

    const deleted: Person[] = [];

    const repository = {
      findById: async () => person,
      delete: async (entity: Person) => {
        deleted.push(entity);
      },
    } as unknown as IPersonRepository;

    const handler = new DeletePersonHandler(repository, cache);
    await handler.handle(1);

    expect(deleted).toEqual([person]);
    expect(cache.invalidateByPrefixCalls).toEqual([PERSON_LIST_CACHE_PREFIX]);
  });

  it('lança NotFoundException quando a pessoa não existe', async () => {
    const repository = {
      findById: async () => null,
      delete: async () => undefined,
    } as unknown as IPersonRepository;

    const handler = new DeletePersonHandler(repository, new CacheStub());

    await expect(handler.handle(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
