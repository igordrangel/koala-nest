import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common'
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core'
import { KoalaGlobalVars } from '../core/koala-global-vars'
import { EnvConfig } from '../core/utils/env.config'
import { FilterRequestParams } from '../core/utils/filter-request-params'
import { ILoggingService } from '../services/logging/ilogging.service'

@Catch()
export class GlobalExceptionsFilter extends BaseExceptionFilter {
  constructor(
    private readonly httpAdapter: AbstractHttpAdapter,
    private readonly loggingService: ILoggingService,
  ) {
    super()
  }

  catch(exception: Error, host: ArgumentsHost): void {
    const filterRequestParams = FilterRequestParams.get(host)

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode,
            timestamp: new Date().toISOString(),
            path: filterRequestParams.filterParams.endpoint,
          }

    this.httpAdapter.reply(
      filterRequestParams.response,
      responseBody,
      statusCode,
    )

    if (
      !exception.message?.includes('Cannot GET /socket.io') &&
      !exception.message?.includes('Cannot GET /favicon.ico') &&
      statusCode !== HttpStatus.UNAUTHORIZED
    ) {
      if (!EnvConfig.isEnvTest) {
        this.loggingService
          .report({
            error: exception,
            packageName: KoalaGlobalVars.appName,
            loggedUsername: filterRequestParams.loggedUserName,
            httpRequest: {
              ...filterRequestParams.filterParams,
              statusCode,
              response: responseBody as any,
            },
          })
          .catch((err) => console.error(err))
      } else {
        console.error(exception)
      }
    }
  }
}
