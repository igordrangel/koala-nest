import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common'
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core'
import { FilterRequestParams } from '../core/utils/filter-request-params'

@Catch()
export class GlobalExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly httpAdapter: AbstractHttpAdapter) {
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

    if (statusCode !== HttpStatus.UNAUTHORIZED) {
      console.error(exception)
    }
  }
}
