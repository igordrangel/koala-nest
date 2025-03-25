import { Type } from "@nestjs/common";

export function assignObject<T>(target: Type<T>, source: T): T {
  return Object.assign(new target() as any, source)
}