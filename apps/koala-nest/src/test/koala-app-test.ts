import { INestApplication, Type } from '@nestjs/common'
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core'
import { PrismaTransactionalClient } from '../core/database/prisma-transactional-client'
import { KoalaGlobalVars } from '../core/koala-global-vars'
import { DomainErrorsFilter } from '../filters/domain-errors.filter'
import { GlobalExceptionsFilter } from '../filters/global-exception.filter'
import { PrismaValidationExceptionFilter } from '../filters/prisma-validation-exception.filter'
import { ZodErrorsFilter } from '../filters/zod-errors.filter'

export class KoalaAppTest {
  private _globalExceptionFilter: BaseExceptionFilter
  private _prismaValidationExceptionFilter: BaseExceptionFilter
  private _domainExceptionFilter: BaseExceptionFilter
  private _zodExceptionFilter: BaseExceptionFilter

  constructor(private readonly app: INestApplication<any>) {
    const { httpAdapter } = app.get(HttpAdapterHost)

    this._globalExceptionFilter = new GlobalExceptionsFilter(httpAdapter)
    this._prismaValidationExceptionFilter =
      new PrismaValidationExceptionFilter()
    this._domainExceptionFilter = new DomainErrorsFilter()
    this._zodExceptionFilter = new ZodErrorsFilter()
  }

  addCustomGlobalExceptionFilter(filter: BaseExceptionFilter) {
    this._globalExceptionFilter = filter
    return this
  }

  addCustomPrismaValidationExceptionFilter(filter: BaseExceptionFilter) {
    this._prismaValidationExceptionFilter = filter
    return this
  }

  addCustomDomainExceptionFilter(filter: BaseExceptionFilter) {
    this._domainExceptionFilter = filter
    return this
  }

  addCustomZodExceptionFilter(filter: BaseExceptionFilter) {
    this._zodExceptionFilter = filter
    return this
  }

  enableCors() {
    this.app.enableCors({
      credentials: true,
      origin: true,
      optionsSuccessStatus: 200,
    })

    return this
  }

  setAppName(name: string) {
    KoalaGlobalVars.appName = name
    return this
  }

  setInternalUserName(name: string) {
    KoalaGlobalVars.internalUserName = name
    return this
  }

  setDbTransactionContext(transactionContext: Type<PrismaTransactionalClient>) {
    KoalaGlobalVars.dbTransactionContext = transactionContext
    return this
  }

  build() {
    this.app.useGlobalFilters(
      this._globalExceptionFilter,
      this._prismaValidationExceptionFilter,
      this._domainExceptionFilter,
      this._zodExceptionFilter,
    )

    return this.app
  }
}