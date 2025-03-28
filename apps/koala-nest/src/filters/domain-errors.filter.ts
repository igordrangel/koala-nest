import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { BadRequestError } from '../core/errors/bad-request.error'
import { ConflictError } from '../core/errors/conflict.error'
import { NoContentError } from '../core/errors/no-content.error'
import { NotAllowedError } from '../core/errors/not-allowed.error'
import { ResourceNotFoundError } from '../core/errors/resource-not-found.error'
import { UserAlreadyExist } from '../core/errors/user-already-exist.error'
import { WrongCredentialsError } from '../core/errors/wrong-credentials.error'
import { KoalaGlobalVars } from '../core/koala-global-vars'
import { EnvConfig } from '../core/utils/env.config'
import { FilterRequestParams } from '../core/utils/filter-request-params'
import { ILoggingService } from '../services/logging/ilogging.service'

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
  constructor(private readonly loggingService: ILoggingService) {
    super()
  }

  public catch(exception: DomainErrors, host: ArgumentsHost) {
    const mappedException = this.map(exception)
    const filterRequestParams = FilterRequestParams.get(host)

    if (mappedException.statusCode !== HttpStatus.UNAUTHORIZED) {
      if (!EnvConfig.isEnvTest) {
        this.loggingService
          .report({
            error: exception,
            packageName: KoalaGlobalVars.appName,
            loggedUsername: filterRequestParams.loggedUserName,
            httpRequest: {
              ...filterRequestParams.filterParams,
              statusCode: mappedException.statusCode,
              response: mappedException,
            },
          })
          .catch((err) => console.error(err))
      } else {
        console.error(exception)
      }
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
