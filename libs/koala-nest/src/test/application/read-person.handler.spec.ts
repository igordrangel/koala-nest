import { describe, expect, it, beforeAll } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { ReadPersonHandler } from '@/application/person/read/read-person.handler';
import { PersonMapper } from '@/application/mapping/person.mapper';
import { Person } from '@/domain/entities/person/person';
import { PersonAddress } from '@/domain/entities/person/person-address';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';

describe('ReadPersonHandler', () => {
  beforeAll(() => {
    PersonMapper.createMap();
  });

  it('retorna pessoa mapeada quando encontrada', async () => {
    const person = Person.from({
      id: 1,
      name: 'Jane',
      active: true,
      address: PersonAddress.from({ id: 2, address: 'Street' }),
      contacts: [],
    });

    const repository = {
      findById: async (id: number) => (id === 1 ? person : null),
    } as unknown as IPersonRepository;

    const handler = new ReadPersonHandler(repository);
    const result = await handler.handle(1);

    expect(result.id).toBe(1);
    expect(result.name).toBe('Jane');
    expect(result.address.address).toBe('Street');
  });

  it('lança NotFoundException quando a pessoa não existe', async () => {
    const repository = {
      findById: async () => null,
    } as unknown as IPersonRepository;

    const handler = new ReadPersonHandler(repository);

    await expect(handler.handle(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
