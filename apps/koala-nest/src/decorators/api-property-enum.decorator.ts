import { ApiProperty } from '@nestjs/swagger'
import { EnumAllowedTypes } from '@nestjs/swagger/dist/interfaces/schema-object-metadata.interface'

interface ApiPropertyEnumOptions {
  enum: EnumAllowedTypes
  required?: boolean
}

export function ApiPropertyEnum(options: ApiPropertyEnumOptions) {
  return function (target: any, propertyKey: string) {
    const enumValues = Object.values(options.enum)
      .filter((value) => typeof value === 'number')
      .map((value) => ({
        value,
        description: options.enum[value],
      }))
    const description = enumValues
      .map((enumValue) => `${enumValue.description}: ${enumValue.value}`)
      .join('\n')
    ApiProperty({
      description: ['```', description, '```'].join('\n'),
      ...options,
    })(target, propertyKey)
  }
}
