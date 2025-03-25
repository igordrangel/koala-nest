import { createUnitTestApp } from "@/test/create-unit-test-app"
import { createPersonRequestMockup } from "@/test/mockup/person/create-person-request.mockup"
import { CreatePersonHandler } from "./create-person.handler"

describe('CreatePersonHandler', () => {
  const app = createUnitTestApp()

  it('should create a person', async () => {
    const handler = app.get(CreatePersonHandler)
    const request = createPersonRequestMockup

    const result = await handler.handle(request)
    
    expect(result.isOk()).toBeTruthy()

    if (result.isOk()) {
      expect(result.value).toEqual({
        id: expect.any(Number)
      })
    }
  })
})