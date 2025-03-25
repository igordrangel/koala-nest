import { z } from 'zod'

export function emailSchema(email?: string, isRequired: boolean = false) {
  if (isRequired && !email) {
    return false
  }

  if (!email) {
    return true
  }

  return z.coerce.string().max(50).email().parse(email)
}
