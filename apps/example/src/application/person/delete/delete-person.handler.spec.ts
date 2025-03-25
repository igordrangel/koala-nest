import { createUnitTestApp } from "@/test/create-unit-test-app"
import { createPersonRequestMockup } from "@/test/mockup/person/create-person-request.mockup"
import { CreatePersonHandler } from "../create/create-person.handler"
import { DeletePersonHandler } from "./delete-person.handler"

describe('DeletePersonHandler', () => {
  const app = createUnitTestApp()

  it('should delete a person', async () => {
    const createResult = await app
      .get(CreatePersonHandler)
      .handle(createPersonRequestMockup)
    
    expect(createResult.isOk()).toBeTruthy()

    if (createResult.isOk()) {
      const result = await app
        .get(DeletePersonHandler)
        .handle(createResult.value.id)

      expect(result.isOk()).toBeTruthy()
    }
  })
})