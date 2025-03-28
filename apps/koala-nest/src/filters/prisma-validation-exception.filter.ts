import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { KoalaGlobalVars } from '../core/koala-global-vars'
import { EnvConfig } from '../core/utils/env.config'
import { FilterRequestParams } from '../core/utils/filter-request-params'
import { ILoggingService } from '../services/logging/ilogging.service'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaValidationExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly loggingService: ILoggingService) {
    super()
  }

  public catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const translatedResponse = this.translate(exception)
    const filterRequestParams = FilterRequestParams.get(host)

    if (translatedResponse.statusCode !== HttpStatus.UNAUTHORIZED) {
      if (!EnvConfig.isEnvTest) {
        this.loggingService
          .report({
            error: exception,
            packageName: KoalaGlobalVars.appName,
            loggedUsername: filterRequestParams.loggedUserName,
            httpRequest: {
              ...filterRequestParams.filterParams,
              statusCode: translatedResponse.statusCode,
              response: translatedResponse,
            },
          })
          .catch((err) => console.error(err))
      } else {
        console.error(exception)
      }
    }

    return filterRequestParams.response
      .status(translatedResponse.statusCode)
      .json(translatedResponse)
  }

  private translate(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Registro já existente.',
        }
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Falha devido a relacionamento. Verifique se o relacionamento existe ou é valido.',
        }
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Registro não encontrado.',
        }
      default:
        console.error(exception)
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Ocorreu um erro desconhecido relacionado aos dados enviados.',
        }
    }
  }
}
