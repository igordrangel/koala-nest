import { EnvConfig } from '@/core/utils/env.config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

/**
 * Oculta o endpoint na documentação OpenAPI fora do ambiente `develop`.
 */
export const ApiExcludeEndpointDiffDevelop = () =>
  ApiExcludeEndpoint(!EnvConfig.isEnvDevelop);
