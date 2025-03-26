import { Type } from '@nestjs/common'

export function assignObject<T>(Target: Type<T>, source: T): T {
  return Object.assign(new Target() as any, source)
}
