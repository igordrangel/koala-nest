import { NotFoundException } from '@nestjs/common';
import { UpdatePersonHandler } from '@/application/person/update/update-person.handler';
import { Person } from '@/domain/entities/person/person';
import { PersonAddress } from '@/domain/entities/person/person-address';
import { PersonContact } from '@/domain/entities/person/person-contact';
import { PERSON_LIST_CACHE_PREFIX } from '@/core/utils/person-list-cache';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { CacheStub } from '@/test/services/cache.stub';

describe('UpdatePersonHandler', () => {
  it('carrega a entidade existente antes de salvar e invalida cache', async () => {
    const cache = new CacheStub();
    const existingContact = PersonContact.from({
      id: 10,
      contact: 'old@example.com',
      person: undefined as unknown as Person,
    });

    const person = Person.from({
      id: 1,
      name: 'Jane',
      active: true,
      address: PersonAddress.from({ id: 5, address: 'Old street' }),
      contacts: [existingContact],
    });
    existingContact.person = person;

    const calls = {
      findById: [] as number[],
      save: [] as Person[],
    };

    const repository = {
      findById: async (id: number) => {
        calls.findById.push(id);
        return id === 1 ? person : null;
      },
      save: async (entity: Person) => {
        calls.save.push(entity);
        return entity;
      },
    } as unknown as IPersonRepository;

    const handler = new UpdatePersonHandler(repository, cache);

    await handler.handle({
      id: 1,
      name: 'Jane Updated',
      address: { id: 5, address: 'New street' },
      contacts: [{ id: 10, contact: 'new@example.com' }],
    });

    expect(calls.findById).toEqual([1]);
    expect(person.name).toBe('Jane Updated');
    expect(person.address.address).toBe('New street');
    expect(person.contacts[0].contact).toBe('new@example.com');
    expect(calls.save).toEqual([person]);
    expect(cache.invalidateByPrefixCalls).toEqual([PERSON_LIST_CACHE_PREFIX]);
  });

  it('remove contatos ausentes do payload (órfãos via TypeORM)', async () => {
    const cache = new CacheStub();
    const keptContact = PersonContact.from({
      id: 10,
      contact: 'keep@example.com',
      person: undefined as unknown as Person,
    });
    const removedContact = PersonContact.from({
      id: 11,
      contact: 'remove@example.com',
      person: undefined as unknown as Person,
    });

    const person = Person.from({
      id: 1,
      name: 'Jane',
      active: true,
      address: PersonAddress.from({ id: 5, address: 'Street' }),
      contacts: [keptContact, removedContact],
    });
    keptContact.person = person;
    removedContact.person = person;

    const repository = {
      findById: async () => person,
      save: async (entity: Person) => entity,
    } as unknown as IPersonRepository;

    const handler = new UpdatePersonHandler(repository, cache);

    await handler.handle({
      id: 1,
      name: 'Jane',
      address: { id: 5, address: 'Street' },
      contacts: [{ id: 10, contact: 'keep@example.com' }],
    });

    expect(person.contacts).toHaveLength(1);
    expect(person.contacts[0].id).toBe(10);
    expect(person.contacts[0].contact).toBe('keep@example.com');
  });

  it('lança NotFoundException quando a pessoa não existe', async () => {
    const repository = {
      findById: async () => null,
      save: async () => undefined,
    } as unknown as IPersonRepository;

    const handler = new UpdatePersonHandler(repository, new CacheStub());

    await expect(
      handler.handle({
        id: 99,
        name: 'Ghost',
        address: { id: 1, address: 'Nowhere' },
        contacts: [],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
