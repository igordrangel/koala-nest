import { createUnitTestApp } from "@/test/create-unit-test-app"
import { createPersonRequestMockup } from "@/test/mockup/person/create-person-request.mockup"
import { CreatePersonHandler } from "../create/create-person.handler"
import { ReadPersonHandler } from "../read/read-person.handler"
import { UpdatePersonHandler } from "./update-person.handler"

describe('UpdatePersonHandler', () => {
  const app = createUnitTestApp()

  it('should update a person by id', async () => {
    const person = createPersonRequestMockup
    const createResult = await app
      .get(CreatePersonHandler)
      .handle(createPersonRequestMockup)
    
    expect(createResult.isOk()).toBeTruthy()

    if (createResult.isOk()) {
      const updateResult = await app
        .get(UpdatePersonHandler)
        .handle({
          id: createResult.value.id,
          data: {
            ...person,
            active: true
          }
        })
      
      expect(updateResult.isOk()).toBeTruthy()

      const result = await app
        .get(ReadPersonHandler)
        .handle(createResult.value.id)

      expect(result.value).toEqual({
        ...person,
        id: createResult.value.id,
        status: 'active'
      })
    }
  })
})