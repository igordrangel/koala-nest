import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { KoalaGlobalVars } from '../core/koala-global-vars'
import { EnvConfig } from '../core/utils/env.config'
import { FilterRequestParams } from '../core/utils/filter-request-params'
import { ILoggingService } from '../services/logging/ilogging.service'

@Catch(ZodError)
export class ZodErrorsFilter extends BaseExceptionFilter {
  constructor(private readonly loggingService: ILoggingService) {
    super()
  }

  public catch(exception: ZodError, host: ArgumentsHost) {
    const filterRequestParams = FilterRequestParams.get(host)

    const zodResponse = {
      errors: fromZodError(exception).details.map(
        (detail) => `${detail.path} ${detail.message.toLowerCase()}`,
      ),
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Dados enviados inválidos',
    }

    if (!EnvConfig.isEnvTest) {
      this.loggingService
        .report({
          error: exception,
          packageName: KoalaGlobalVars.appName,
          loggedUsername: filterRequestParams.loggedUserName,
          httpRequest: {
            ...filterRequestParams.filterParams,
            statusCode: HttpStatus.BAD_REQUEST,
            response: zodResponse,
          },
        })
        .catch((err) => console.error(err))
    } else {
      console.error(exception)
    }

    return filterRequestParams.response
      .status(HttpStatus.BAD_REQUEST)
      .send(zodResponse)
  }
}
