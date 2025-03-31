import { createUnitTestApp } from '@/test/create-unit-test-app'
import { createPersonRequestMockup } from '@/test/mockup/person/create-person-request.mockup'
import { CreatePersonHandler } from '../create/create-person.handler'
import { ReadPersonHandler } from './read-person.handler'

describe('ReadPersonHandler', () => {
  const app = createUnitTestApp()

  it('should get a person by id', async () => {
    const createResult = await app
      .get(CreatePersonHandler)
      .handle(createPersonRequestMockup)

    expect(createResult.isOk()).toBeTruthy()

    if (createResult.isOk()) {
      const result = await app
        .get(ReadPersonHandler)
        .handle(createResult.value.id)

      expect(result.isOk()).toBeTruthy()

      if (result.isOk()) {
        expect(result.value.id).toBe(createResult.value.id)
      }
    }
  })
})
