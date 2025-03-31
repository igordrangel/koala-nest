import { createUnitTestApp } from '@/test/create-unit-test-app'
import { createPersonRequestMockup } from '@/test/mockup/person/create-person-request.mockup'
import { CreatePersonHandler } from '../create/create-person.handler'
import { ReadPersonHandler } from '../read/read-person.handler'
import { UpdatePersonHandler } from './update-person.handler'

describe('UpdatePersonHandler', () => {
  const app = createUnitTestApp()

  it('should update a person by id', async () => {
    const person = createPersonRequestMockup
    const createResult = await app
      .get(CreatePersonHandler)
      .handle(createPersonRequestMockup)

    expect(createResult.isOk()).toBeTruthy()

    if (createResult.isOk()) {
      const updateResult = await app.get(UpdatePersonHandler).handle({
        id: createResult.value.id,
        data: {
          ...person,
          address: {
            id: 1,
            ...person.address,
          },
          active: true,
        },
      })

      expect(updateResult.isOk()).toBeTruthy()

      const result = await app
        .get(ReadPersonHandler)
        .handle(createResult.value.id)

      expect(result.isOk()).toBeTruthy()

      if (result.isOk()) {
        expect(result.value.name).toEqual(person.name)
        expect(result.value.active).toEqual(true)
        expect(result.value.address.address).toEqual(person.address.address)
        expect(result.value.phones[0].phone).toEqual(person.phones[0].phone)
      }
    }
  })
})
