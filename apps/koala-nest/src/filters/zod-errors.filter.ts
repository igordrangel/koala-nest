import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { FilterRequestParams } from '../core/utils/filter-request-params'

@Catch(ZodError)
export class ZodErrorsFilter extends BaseExceptionFilter {
  public catch(exception: ZodError, host: ArgumentsHost) {
    const filterRequestParams = FilterRequestParams.get(host)

    const zodResponse = {
      errors: fromZodError(exception).details.map(
        (detail) => `${detail.path} ${detail.message.toLowerCase()}`,
      ),
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Dados enviados inválidos',
    }

    return filterRequestParams.response
      .status(HttpStatus.BAD_REQUEST)
      .send(zodResponse)
  }
}
