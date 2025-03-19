import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { EnvConfig } from '../core/utils/env.config'

export const ApiPropertyOnlyDevelop = (propertyOptions: ApiPropertyOptions) => {
  return EnvConfig.isEnvDevelop ? ApiProperty(propertyOptions) : () => {}
}
