import { EnvConfig } from '@/core/utils/env.config';
import {
  ApiHideProperty,
  ApiProperty,
  type ApiPropertyOptions,
} from '@nestjs/swagger';

/**
 * Documenta a propriedade no Swagger apenas no ambiente `develop`.
 */
export function ApiPropertyOnlyDevelop(options?: ApiPropertyOptions) {
  return function (target: object, propertyKey: string | symbol) {
    if (EnvConfig.isEnvDevelop) {
      ApiProperty(options)(target, propertyKey);
    } else {
      ApiHideProperty()(target, propertyKey);
    }
  };
}
