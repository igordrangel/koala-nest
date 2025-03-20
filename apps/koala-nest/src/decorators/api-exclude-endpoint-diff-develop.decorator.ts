import { ApiExcludeEndpoint } from '@nestjs/swagger'
import { EnvConfig } from '../core/utils/env.config'

export const ApiExcludeEndpointDiffDevelop = () => {
  return ApiExcludeEndpoint(!EnvConfig.isEnvDevelop)
}
