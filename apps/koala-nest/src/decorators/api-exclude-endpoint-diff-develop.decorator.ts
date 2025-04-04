import { ApiExcludeEndpoint } from '@nestjs/swagger'
import { EnvConfig } from '../core/utils/env.config'

/**
 * Um decorator personalizado que utiliza o `ApiExcludeEndpoint` do NestJS Swagger
 * para excluir endpoints da documentação da API com base no ambiente de execução.
 *
 * Este decorator verifica se o ambiente atual não é de desenvolvimento (`!EnvConfig.isEnvDevelop`).
 * Se o ambiente não for de desenvolvimento, o endpoint será excluído da documentação.
 *
 * @returns Um decorator que aplica a exclusão condicional do endpoint na documentação da API.
 */
export const ApiExcludeEndpointDiffDevelop = () => {
  return ApiExcludeEndpoint(!EnvConfig.isEnvDevelop)
}
