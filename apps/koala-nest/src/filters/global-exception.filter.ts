import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { IncomingMessage } from 'node:http'
import { KoalaGlobalVars } from '../core/koala-global-vars'
import { EnvConfig } from '../core/utils/env.config'
import { FilterRequestParams } from '../core/utils/filter-request-params'
import { ILoggingService } from '../services/logging/ilogging.service'

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly loggingService: ILoggingService,
  ) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost

    const filterRequestParams = FilterRequestParams.get(host)
    const request: IncomingMessage | null =
      host.getArgs().find((arg) => arg instanceof IncomingMessage) ?? null

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

    httpAdapter.reply(filterRequestParams.response, responseBody, statusCode)

    if (
      !exception.message?.includes('Cannot GET /socket.io') &&
      !exception.message?.includes('Cannot GET /favicon.ico') &&
      !['/'].includes(request?.url ?? '') &&
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
