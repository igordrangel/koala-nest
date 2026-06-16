/// <reference types="bun-types/test-globals" />

import { CreatePersonHandler } from '@/application/person/create/create-person.handler';
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler';
import { ReadManyPersonRequest } from '@/application/person/read-many/read-many-person.request';
import { ReadPersonHandler } from '@/application/person/read/read-person.handler';
import { AppTestModule } from '@/test/app-test.module';
import { PersonQueryDto } from '@/domain/dtos/person-query.dto';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Test, TestingModule } from '@nestjs/testing';

/**
 * Valida carregamento explícito de relacionamentos no repositório.
 * - findById: relations { address, contacts }
 * - findMany: sem relations (listagem leve; contacts normalizado como [])
 */
describe('PersonRepository - Relations (E2E)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppTestModule],
    }).compile();
  });

  describe('findById - relations explícitas', () => {
    it('should load person with address and contacts using findById', async () => {
      const createHandler = moduleRef.get(CreatePersonHandler);
      const created = await createHandler.handle({
        name: 'João Silva',
        contacts: [
          { contact: 'joao@example.com' },
          { contact: 'joao.silva@example.com' },
        ],
        address: {
          address: 'Rua Principal, 123 - São Paulo',
        },
      });

      const readHandler = moduleRef.get(ReadPersonHandler);
      const person = await readHandler.handle(created.id);

      expect(person.id).toBe(created.id);
      expect(person.name).toBe('João Silva');
      expect(person.address).toBeDefined();
      expect(person.address.address).toBe('Rua Principal, 123 - São Paulo');
      expect(person.contacts).toBeDefined();
      expect(person.contacts.length).toBe(2);
      expect(person.contacts.map((c) => c.contact).sort()).toEqual([
        'joao.silva@example.com',
        'joao@example.com',
      ]);
    });
  });

  describe('findMany - listagem sem relations', () => {
    it('should return persons without loading relations in findMany', async () => {
      const createHandler = moduleRef.get(CreatePersonHandler);

      for (let i = 0; i < 2; i++) {
        await createHandler.handle({
          name: `Pessoa ${i + 1}`,
          contacts: [{ contact: `contact${i}@example.com` }],
          address: {
            address: `Rua ${i + 1}, 100`,
          },
        });
      }

      const repository = moduleRef.get(IPersonRepository);
      const query = PersonQueryDto.from({ limit: 100, page: 0 });
      const { items } = await repository.findMany(query);

      expect(items.length).toBeGreaterThan(0);

      const person = items[0];
      expect(person.id).toBeDefined();
      expect(person.name).toBeDefined();
      expect(person.address).toBeUndefined();
      expect(person.contacts ?? []).toHaveLength(0);
    });

    it('should list via handler without requiring relations on entities', async () => {
      const createHandler = moduleRef.get(CreatePersonHandler);

      const createdIds: number[] = [];
      for (let i = 0; i < 3; i++) {
        const result = await createHandler.handle({
          name: `ListPerson ${i + 1}`,
          contacts: [{ contact: `list${i}@example.com` }],
          address: {
            address: `Rua Lista ${i + 1}`,
          },
        });
        createdIds.push(result.id);
      }

      const readManyHandler = moduleRef.get(ReadManyPersonHandler);
      const result = await readManyHandler.handle(new ReadManyPersonRequest());

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.count).toBeGreaterThan(0);

      const returnedIds = result.items.map((p) => p.id);
      createdIds.forEach((id) => {
        expect(returnedIds).toContain(id);
      });
    });
  });

  describe('findById vs findMany', () => {
    it('findById carrega relations; findMany retorna entidade leve', async () => {
      const createHandler = moduleRef.get(CreatePersonHandler);
      const created = await createHandler.handle({
        name: 'Comparação Test',
        contacts: [{ contact: 'first@example.com' }],
        address: {
          address: 'Rua Comparação, 789',
        },
      });

      const readHandler = moduleRef.get(ReadPersonHandler);
      const personFromFindById = await readHandler.handle(created.id);

      const repository = moduleRef.get(IPersonRepository);
      const { items } = await repository.findMany(
        PersonQueryDto.from({ limit: 100, page: 0 }),
      );
      const personFromFindMany = items.find((p) => p.id === created.id);

      expect(personFromFindMany).toBeDefined();
      expect(personFromFindById.id).toBe(personFromFindMany!.id);
      expect(personFromFindById.name).toBe(personFromFindMany!.name);
      expect(personFromFindById.address).toBeDefined();
      expect(personFromFindById.contacts).toBeDefined();
      expect(personFromFindById.contacts.length).toBeGreaterThan(0);
      expect(personFromFindMany?.address).toBeUndefined();
      expect(personFromFindMany?.contacts ?? []).toHaveLength(0);
    });
  });
});
