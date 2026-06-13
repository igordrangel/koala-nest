import { z } from 'zod';

export function emailSchema(email?: string, isRequired = false) {
  if (isRequired && !email) {
    return false;
  }

  if (!email) {
    return true;
  }

  return z.coerce.string().max(50).pipe(z.email()).safeParse(email).success;
}
