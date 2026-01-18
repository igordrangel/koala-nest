import { ApiProperty } from '@nestjs/swagger'
import { EnumAllowedTypes } from '@nestjs/swagger/dist/interfaces/schema-object-metadata.interface'

interface ApiPropertyEnumOptions {
  enum: EnumAllowedTypes
  isArray?: boolean
  required?: boolean
}

/**
 * Um decorator personalizado para documentar propriedades de enumeração em classes do NestJS
 * usando o Swagger.
 *
 * @param options - As opções para configurar o decorator.
 * @param options.enum - O enum que será documentado. Deve ser um tipo permitido pelo Swagger.
 * @param options.isArray - Indica se a propriedade é um array de enums. Por padrão, é falso.
 * @param options.required - Indica se a propriedade é obrigatória. Por padrão, é opcional.
 *
 * @description
 * Este decorator é usado para gerar automaticamente a documentação de propriedades
 * que utilizam enums. Ele cria uma descrição detalhada com os valores e suas respectivas
 * descrições, formatada em Markdown para exibição no Swagger UI.
 *
 * @example
 * ```typescript
 * import { ApiPropertyEnum } from './api-property-enum.decorator';
 *
 * enum Status {
 *   ACTIVE = 1,
 *   INACTIVE = 2,
 * }
 *
 * class ExampleDto {
 *   \@ApiPropertyEnum({ enum: Status, required: true })
 *   status: Status;
 * }
 * ```
 *
 * No exemplo acima, o Swagger exibirá a propriedade `status` com uma descrição detalhada
 * dos valores possíveis do enum `Status` (e.g., "ACTIVE: 1\nINACTIVE: 2").
 */
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
      ...options,
      description: ['```', description, '```'].join('\n'),
    })(target, propertyKey)
  }
}
