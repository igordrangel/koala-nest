import { createUnitTestApp } from '@/test/create-unit-test-app'
import { createPersonRequestMockup } from '@/test/mockup/person/create-person-request.mockup'
import { RequestResult } from '@koalarx/nest/core/request-overflow/request-result'
import { CreatePersonHandler } from '../create/create-person.handler'
import { CreatePersonResponse } from '../create/create-person.response'
import { ReadManyPersonHandler } from './read-many-person.handler'
import { ReadManyPersonRequest } from './read-many-person.request'

describe('ReadManyPersonHandler', () => {
  const app = createUnitTestApp()
  const person = createPersonRequestMockup

  let personId: number
  let createResult: RequestResult<Error, CreatePersonResponse>

  beforeAll(async () => {
    createResult = await app
      .get(CreatePersonHandler)
      .handle(createPersonRequestMockup)

    expect(createResult.isOk()).toBeTruthy()

    if (createResult.isOk()) {
      personId = createResult.value.id
    }
  })

  it('should get all persons', async () => {
    const result = await app
      .get(ReadManyPersonHandler)
      .handle(new ReadManyPersonRequest())

    expect(result.isOk()).toBeTruthy()

    if (result.isOk()) {
      expect(result.value.items).toHaveLength(1)
    }
  })

  it('should get persons by name', async () => {
    const result = await app.get(ReadManyPersonHandler).handle(
      new ReadManyPersonRequest({
        name: person.name,
      }),
    )

    expect(result.isOk()).toBeTruthy()

    if (result.isOk()) {
      expect(result.value.items[0].name).toBe(person.name)
      expect(result.value.items).toHaveLength(1)
    }
  })

  it('should get persons by status', async () => {
    const result = await app.get(ReadManyPersonHandler).handle(
      new ReadManyPersonRequest({
        active: true,
      }),
    )

    expect(result.value).toEqual({
      items: [],
      count: 0,
    })
  })
})
