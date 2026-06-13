import { z } from 'zod';

type NativeEnumLike = Record<string, string | number>;

interface NativeEnumInterface<TEnum extends NativeEnumLike> {
  isOptional: (value: string) => TEnum[keyof TEnum] | undefined;
  isRequired: (value: string) => TEnum[keyof TEnum];
}

export function nativeEnumSchema<TEnum extends NativeEnumLike>(
  nativeEnum: TEnum,
): NativeEnumInterface<TEnum> {
  return {
    isOptional: (value: string) => {
      if (value === 'null' || value === '') {
        return undefined;
      }

      return z.coerce
        .number()
        .transform((parsed) => {
          if (parsed !== undefined) {
            return z.nativeEnum(nativeEnum).parse(parsed);
          }

          return undefined;
        })
        .parse(value);
    },
    isRequired: (value: string) =>
      z.coerce
        .number()
        .transform((parsed) => z.nativeEnum(nativeEnum).parse(parsed))
        .parse(value),
  };
}
