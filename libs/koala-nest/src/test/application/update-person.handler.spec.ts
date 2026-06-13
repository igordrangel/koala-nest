import { describe, expect, it, mock } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import { UpdatePersonHandler } from '@/application/person/update/update-person.handler';
import { Person } from '@/domain/entities/person/person';
import { PersonAddress } from '@/domain/entities/person/person-address';
import { PersonContact } from '@/domain/entities/person/person-contact';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';

describe('UpdatePersonHandler', () => {
  it('carrega a entidade existente antes de salvar', async () => {
    const existingContact = PersonContact.from({
      id: 10,
      contact: 'old@example.com',
      person: undefined as unknown as Person,
    });

    const person = Person.from({
      id: 1,
      name: 'Jane',
      address: PersonAddress.from({ id: 5, address: 'Old street' }),
      contacts: [existingContact],
    });
    existingContact.person = person;

    const repository = {
      findById: mock(async (id: number) => (id === 1 ? person : null)),
      save: mock(async (entity: Person) => entity),
    } as unknown as IPersonRepository;

    const handler = new UpdatePersonHandler(repository);

    await handler.handle({
      id: 1,
      name: 'Jane Updated',
      address: { id: 5, address: 'New street' },
      contacts: [{ id: 10, contact: 'new@example.com' }],
    });

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(person.name).toBe('Jane Updated');
    expect(person.address.address).toBe('New street');
    expect(person.contacts[0].contact).toBe('new@example.com');
    expect(repository.save).toHaveBeenCalledWith(person);
  });

  it('lança NotFoundException quando a pessoa não existe', async () => {
    const repository = {
      findById: mock(async () => null),
      save: mock(async () => undefined),
    } as unknown as IPersonRepository;

    const handler = new UpdatePersonHandler(repository);

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
