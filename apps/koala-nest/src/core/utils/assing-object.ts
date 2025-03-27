import { Type } from '@nestjs/common'

export type ObjectProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
}

export function assignObject<T>(Target: Type<T>, source: ObjectProps<T>): T {
  return Object.assign(new Target() as any, source)
}
