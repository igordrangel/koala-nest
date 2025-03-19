import { RequestResult, failure, ok } from './request-result'

function doSometing(shouldSuccess: boolean): RequestResult<string, number> {
  if (shouldSuccess) {
    return ok(10)
  } else {
    return failure('error')
  }
}

test('success result', () => {
  const result = doSometing(true)

  expect(result.isOk()).toBe(true)
  expect(result.isFailure()).toBe(false)
})

test('error result', () => {
  const result = doSometing(false)

  expect(result.isFailure()).toBe(true)
  expect(result.isOk()).toBe(false)
})
