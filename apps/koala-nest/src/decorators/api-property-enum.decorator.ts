import { ApiProperty } from '@nestjs/swagger'

interface ApiPropertyEnumOptions {
  required?: boolean
}

export function ApiPropertyEnum(options: ApiPropertyEnumOptions) {
  return function (target: any, propertyKey: string) {
    const enumValues = Object.values(target[propertyKey])
      .filter((value) => typeof value === 'number')
      .map((value) => ({
        value,
        description: target[propertyKey][value],
      }))
    const description = enumValues
      .map((enumValue) => `\`${enumValue.description}\`: ${enumValue.value}`)
      .join('\n')
    ApiProperty({
      enum: target[propertyKey],
      description: ['```', description, '```'].join('\n'),
      ...options,
    })(target, propertyKey)
  }
}
