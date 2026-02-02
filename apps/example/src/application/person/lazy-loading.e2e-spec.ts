import { CreatePersonHandler } from '@/application/person/create/create-person.handler'
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler'
import { ReadPersonHandler } from '@/application/person/read/read-person.handler'
import { createUnitTestApp } from '@/test/create-unit-test-app'
import { PaginationDto } from '@koalarx/nest/core/dtos/pagination.dto'

/**
 * Testes E2E do RepositoryBase - Lazy Loading
 *
 * Valida o carregamento efetivo de relacionamentos em diferentes cenários:
 * - findById: carrega recursivamente todos os relacionamentos
 * - findFirst/findUnique: carrega recursivamente todos os relacionamentos
 * - findMany: carrega com otimização para listas
 */
describe('RepositoryBase - Lazy Loading (E2E)', () => {
  const app = createUnitTestApp()

  describe('findById - Carregamento de Relacionamentos', () => {
    it('should load person with all relationships using findById', async () => {
      // Criar uma pessoa com endereço e telefones
      const createHandler = app.get(CreatePersonHandler)
      const createResult = await createHandler.handle({
        name: 'João Silva',
        phones: [{ phone: '11999999999' }, { phone: '11888888888' }],
        address: {
          address: 'Rua Principal, 123 - São Paulo',
        },
      })

      expect(createResult.isOk()).toBeTruthy()

      if (!createResult.isOk()) {
        throw new Error('Falha ao criar pessoa')
      }

      const personId = createResult.value.id

      // Buscar a pessoa com findById
      const readHandler = app.get(ReadPersonHandler)
      const readResult = await readHandler.handle(personId)

      expect(readResult.isOk()).toBeTruthy()

      if (!readResult.isOk()) {
        throw new Error('Falha ao ler pessoa')
      }

      const person = readResult.value

      // Validar entidade raiz
      expect(person).toBeDefined()
      expect(person.id).toBe(personId)
      expect(person.name).toBe('João Silva')

      // Validar relacionamentos carregados
      expect(person.address).toBeDefined()
      expect(person.address.address).toBe('Rua Principal, 123 - São Paulo')

      expect(person.phones).toBeDefined()
      const isPhonesList =
        person.phones &&
        typeof person.phones === 'object' &&
        'toArray' in person.phones
      expect(Array.isArray(person.phones) || isPhonesList).toBe(true)

      // Validar conteúdo dos telefones
      const phonesArray = Array.isArray(person.phones)
        ? person.phones
        : isPhonesList
          ? (person.phones as any).toArray('all')
          : []
      expect(phonesArray.length).toBe(2)
      expect(phonesArray.map((p: any) => p.phone).sort()).toEqual([
        '11888888888',
        '11999999999',
      ])
    })

    it('should have all relationships loaded and accessible', async () => {
      const createHandler = app.get(CreatePersonHandler)
      const createResult = await createHandler.handle({
        name: 'Test Person',
        phones: [{ phone: '21987654321' }],
        address: {
          address: 'Test Address',
        },
      })

      expect(createResult.isOk()).toBeTruthy()

      if (!createResult.isOk()) {
        throw new Error('Falha ao criar pessoa')
      }

      const personId = createResult.value.id

      // Buscar com findById
      const readHandler = app.get(ReadPersonHandler)
      const readResult = await readHandler.handle(personId)

      expect(readResult.isOk()).toBeTruthy()

      if (!readResult.isOk()) {
        throw new Error('Falha ao ler pessoa')
      }

      const person = readResult.value

      // Validar que relacionamentos foram carregados
      expect(person.id).toBe(personId)
      expect(person.address).toBeDefined()
      expect(person.address.address).toBeDefined()
      expect(person.phones).toBeDefined()

      // Validar acesso aos dados
      const phonesArray = Array.isArray(person.phones)
        ? person.phones
        : 'toArray' in (person.phones || {})
          ? (person.phones as any).toArray('all')
          : []
      expect(phonesArray.length).toBeGreaterThan(0)
    })
  })

  describe('findMany - Carregamento Otimizado para Listas', () => {
    it('should load persons with relationships in findMany', async () => {
      const createHandler = app.get(CreatePersonHandler)

      for (let i = 0; i < 2; i++) {
        await createHandler.handle({
          name: `Pessoa ${i + 1}`,
          phones: [{ phone: `1199999999${i}` }],
          address: {
            address: `Rua ${i + 1}, 100`,
          },
        })
      }

      const readManyHandler = app.get(ReadManyPersonHandler)
      const readManyResult = await readManyHandler.handle(new PaginationDto())

      expect(readManyResult.isOk()).toBeTruthy()

      if (!readManyResult.isOk()) {
        throw new Error('Falha ao ler pessoas')
      }

      const { items } = readManyResult.value

      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(0)

      // Validar estrutura básica
      const person = items[0]
      expect(person.id).toBeDefined()
      expect(person.name).toBeDefined()
      expect(person.address).toBeDefined()
      expect(person.phones).toBeDefined()
    })

    it('should load multiple persons efficiently', async () => {
      const createHandler = app.get(CreatePersonHandler)

      const createdIds: number[] = []
      for (let i = 0; i < 3; i++) {
        const result = await createHandler.handle({
          name: `ListPerson ${i + 1}`,
          phones: [{ phone: `2188888888${i}` }],
          address: {
            address: `Rua Lista ${i + 1}`,
          },
        })

        if (result.isOk()) {
          createdIds.push(result.value.id)
        }
      }

      expect(createdIds.length).toBe(3)

      const readManyHandler = app.get(ReadManyPersonHandler)
      const readManyResult = await readManyHandler.handle(new PaginationDto())

      expect(readManyResult.isOk()).toBeTruthy()

      if (!readManyResult.isOk()) {
        throw new Error('Falha ao ler pessoas')
      }

      const { items, count } = readManyResult.value

      expect(items.length).toBeGreaterThan(0)
      expect(count).toBeGreaterThan(0)

      // Validar que criados estão na lista
      const returnedIds = items.map((p) => p.id)
      createdIds.forEach((id) => {
        expect(returnedIds).toContain(id)
      })

      // Cada pessoa deve ter dados básicos
      items.forEach((person) => {
        expect(person.id).toBeDefined()
        expect(person.name).toBeDefined()
      })
    })
  })

  describe('Comparação entre findById e findMany', () => {
    it('should load relationships in both methods', async () => {
      const createHandler = app.get(CreatePersonHandler)
      const createResult = await createHandler.handle({
        name: 'Comparação Test',
        phones: [{ phone: '3122222222' }, { phone: '3133333333' }],
        address: {
          address: 'Rua Comparação, 789',
        },
      })

      expect(createResult.isOk()).toBeTruthy()

      if (!createResult.isOk()) {
        throw new Error('Falha ao criar pessoa')
      }

      const personId = createResult.value.id

      // Buscar com findById
      const readHandler = app.get(ReadPersonHandler)
      const findByIdResult = await readHandler.handle(personId)

      expect(findByIdResult.isOk()).toBeTruthy()

      if (!findByIdResult.isOk()) {
        throw new Error('Falha ao ler pessoa com findById')
      }

      const personFromFindById = findByIdResult.value

      // Buscar com findMany
      const readManyHandler = app.get(ReadManyPersonHandler)
      const findManyResult = await readManyHandler.handle(new PaginationDto())

      expect(findManyResult.isOk()).toBeTruthy()

      if (!findManyResult.isOk()) {
        throw new Error('Falha ao ler pessoas com findMany')
      }

      const personFromFindMany = findManyResult.value.items.find(
        (p) => p.id === personId,
      )

      expect(personFromFindMany).toBeDefined()

      // Ambas devem ter a entidade raiz
      expect(personFromFindById.id).toBe(personFromFindMany?.id)
      expect(personFromFindById.name).toBe(personFromFindMany?.name)

      // findById deve ter relacionamentos carregados
      expect(personFromFindById.address).toBeDefined()
      expect(personFromFindById.phones).toBeDefined()
      const findByIdPhonesArray = Array.isArray(personFromFindById.phones)
        ? personFromFindById.phones
        : 'toArray' in (personFromFindById.phones || {})
          ? (personFromFindById.phones as any).toArray('all')
          : []
      expect(findByIdPhonesArray.length).toBeGreaterThan(0)

      // findMany também deve ter relacionamentos
      expect(personFromFindMany?.address).toBeDefined()
      expect(personFromFindMany?.phones).toBeDefined()

      // Ambas estratégias carregam relacionamentos efetivamente
      const findManyPhonesArray = Array.isArray(personFromFindMany?.phones)
        ? personFromFindMany?.phones
        : personFromFindMany?.phones && 'toArray' in personFromFindMany.phones
          ? (personFromFindMany.phones as any).toArray('all')
          : []
      expect(findManyPhonesArray.length).toBeGreaterThan(0)
      expect(findByIdPhonesArray.length).toBeGreaterThan(0)
    })
  })
})
