import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { FilterRequestParams } from '../core/utils/filter-request-params'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaValidationExceptionFilter extends BaseExceptionFilter {
  public catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const translatedResponse = this.translate(exception)
    const filterRequestParams = FilterRequestParams.get(host)

    if (translatedResponse.statusCode !== HttpStatus.UNAUTHORIZED) {
      console.error(exception)
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
