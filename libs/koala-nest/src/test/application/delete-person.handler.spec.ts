import { describe, expect, it } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler';
import { Person } from '@/domain/entities/person/person';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';
import type { ICacheService } from '@/domain/common/icache.service';

const cacheStub = {
  get: () => Promise.resolve(null),
  set: () => Promise.resolve(),
  setIfNotExists: () => Promise.resolve(true),
  invalidate: () => Promise.resolve(),
  invalidateByPrefix: () => Promise.resolve(),
} as ICacheService;

describe('DeletePersonHandler', () => {
  it('remove pessoa existente', async () => {
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

    const handler = new DeletePersonHandler(repository, cacheStub);
    await handler.handle(1);

    expect(deleted).toEqual([person]);
  });

  it('lança NotFoundException quando a pessoa não existe', async () => {
    const repository = {
      findById: async () => null,
      delete: async () => undefined,
    } as unknown as IPersonRepository;

    const handler = new DeletePersonHandler(repository, cacheStub);

    await expect(handler.handle(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
