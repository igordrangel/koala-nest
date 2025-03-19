import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { BadRequestError } from '../common/errors/bad-request.error'
import { ConflictError } from '../common/errors/conflict.error'
import { NoContentError } from '../common/errors/no-content.error'
import { NotAllowedError } from '../common/errors/not-allowed.error'
import { ResourceNotFoundError } from '../common/errors/resource-not-found.error'
import { UserAlreadyExist } from '../common/errors/user-already-exist.error'
import { WrongCredentialsError } from '../common/errors/wrong-credentials.error'
import { FilterRequestParams } from '../core/utils/filter-request-params'

type DomainErrors =
  | NotAllowedError
  | ResourceNotFoundError
  | UserAlreadyExist
  | WrongCredentialsError
  | ConflictError
  | BadRequestError
  | NoContentError

@Catch(
  NotAllowedError,
  ResourceNotFoundError,
  UserAlreadyExist,
  WrongCredentialsError,
  ConflictError,
  BadRequestError,
  NoContentError,
)
export class DomainErrorsFilter extends BaseExceptionFilter {
  public catch(exception: DomainErrors, host: ArgumentsHost) {
    const mappedException = this.map(exception)
    const filterRequestParams = FilterRequestParams.get(host)

    if (mappedException.statusCode !== HttpStatus.UNAUTHORIZED) {
      console.error(exception)
    }

    return filterRequestParams.response
      .status(mappedException.statusCode)
      .json(mappedException)
  }

  private map(exception: DomainErrors) {
    const mappedException = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message,
    }

    switch (exception.constructor) {
      case UserAlreadyExist:
      case NotAllowedError:
      case BadRequestError:
        mappedException.statusCode = HttpStatus.BAD_REQUEST
        break
      case ResourceNotFoundError:
        mappedException.statusCode = HttpStatus.NOT_FOUND
        break
      case WrongCredentialsError:
        mappedException.statusCode = HttpStatus.UNAUTHORIZED
        break
      case ConflictError:
        mappedException.statusCode = HttpStatus.CONFLICT
        break
      case NoContentError:
        mappedException.statusCode = HttpStatus.NO_CONTENT
        break
      default:
        console.error(exception)
    }

    return mappedException
  }
}
