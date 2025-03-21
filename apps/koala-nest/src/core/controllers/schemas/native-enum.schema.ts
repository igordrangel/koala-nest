import { z } from 'zod'

interface NativeEnumInterface<TEnum> {
  isOptional: (value: string) => TEnum[keyof TEnum] | undefined
  isRequired: (value: string) => TEnum[keyof TEnum]
}

export function nativeEnumSchema<TEnum extends z.EnumLike>(
  nativeEnum: TEnum,
): NativeEnumInterface<TEnum> {
  return {
    isOptional: (value: string) => {
      if (value === 'null' || value === '') {
        return undefined
      }

      return z.coerce
        .number()
        .transform((value) => {
          if (value !== undefined) {
            return z.nativeEnum(nativeEnum).parse(value)
          }
          return undefined
        })
        .parse(value)
    },
    isRequired: (value: string) => {
      return z.coerce
        .number()
        .transform((value) => z.nativeEnum(nativeEnum).parse(value))
        .parse(value)
    },
  }
}
