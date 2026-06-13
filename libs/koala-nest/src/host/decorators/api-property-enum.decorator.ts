import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';

type ApiPropertyEnumOptions = Pick<
  ApiPropertyOptions,
  'enum' | 'isArray' | 'required'
>;

function resolveEnumValues(enumObject: Record<string, string | number>) {
  const numericValues = Object.values(enumObject).filter(
    (value) => typeof value === 'number',
  );

  if (numericValues.length > 0) {
    return numericValues.map((value) => ({
      value,
      description: String(enumObject[value]),
    }));
  }

  return Object.values(enumObject)
    .filter((value) => typeof value === 'string')
    .map((value) => ({
      value,
      description: String(value),
    }));
}

/**
 * Documenta enums no Swagger com descrição em Markdown.
 */
export function ApiPropertyEnum(options: ApiPropertyEnumOptions) {
  return function (target: object, propertyKey: string | symbol) {
    const enumObject = options.enum as Record<string, string | number>;
    const enumValues = resolveEnumValues(enumObject);

    const description = enumValues
      .map((enumValue) => `${enumValue.description}: ${enumValue.value}`)
      .join('\n');

    const apiPropertyOptions = {
      ...options,
      description: description ? ['```', description, '```'].join('\n') : undefined,
    } as ApiPropertyOptions;

    ApiProperty(apiPropertyOptions)(target, propertyKey);
  };
}
