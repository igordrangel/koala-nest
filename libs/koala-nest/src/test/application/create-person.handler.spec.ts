import { describe, expect, it, beforeAll } from 'bun:test';
import { CreatePersonHandler } from '@/application/person/create/create-person.handler';
import { PersonMapper } from '@/application/mapping/person.mapper';
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

describe('CreatePersonHandler', () => {
  beforeAll(() => {
    PersonMapper.createMap();
  });
  it('valida, persiste e retorna o id da pessoa criada', async () => {
    const saved: Person[] = [];

    const repository = {
      save: async (person: Person) => {
        const created = Person.from({ ...person, id: 42 });
        saved.push(created);
        return created;
      },
    } as unknown as IPersonRepository;

    const handler = new CreatePersonHandler(repository, cacheStub);

    const result = await handler.handle({
      name: 'John Doe',
      address: { address: 'Street 1' },
      contacts: [{ contact: 'john@example.com' }],
    });

    expect(result.id).toBe(42);
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('John Doe');
  });
});
