import { z } from 'zod'

export function booleanSchema() {
  return z.coerce.string().transform((value) => {
    if (value !== undefined) {
      return value === 'true'
    }
    return undefined
  })
}
