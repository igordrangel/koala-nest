import { ApiProperty } from '@nestjs/swagger'

interface ApiPropertyEnumOptions {
  required?: boolean
}

export function ApiPropertyEnum(options: ApiPropertyEnumOptions) {
  return function (target: any, propertyKey: string) {
    const enumClass = target[propertyKey]
    const enumValues = Object.values(enumClass)
      .filter((value) => typeof value === 'number')
      .map((value) => ({
        value,
        // Colocado [value as number] de forma explicita para evitar erro de compilação
        description: enumClass[value as number],
      }))
    const description = enumValues
      .map((enumValue) => `\`${enumValue.description}\`: ${enumValue.value}`)
      .join('\n')
    ApiProperty({
      enum: enumClass,
      description: ['```', description, '```'].join('\n'),
      ...options,
    })(target, propertyKey)
  }
}
