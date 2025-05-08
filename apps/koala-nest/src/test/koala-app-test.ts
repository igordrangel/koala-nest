import { CanActivate, INestApplication, Type } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { PrismaTransactionalClient } from '../core/database/prisma-transactional-client'
import { KoalaGlobalVars } from '../core/koala-global-vars'
import { instanciateClassWithDependenciesInjection } from '../core/utils/instanciate-class-with-dependencies-injection'
import { DomainErrorsFilter } from '../filters/domain-errors.filter'
import { GlobalExceptionsFilter } from '../filters/global-exception.filter'
import { PrismaValidationExceptionFilter } from '../filters/prisma-validation-exception.filter'
import { ZodErrorsFilter } from '../filters/zod-errors.filter'
import { ILoggingService } from '../services/logging/ilogging.service'

export class KoalaAppTest {
  private _guards: CanActivate[] = []
  private _globalExceptionFilter: BaseExceptionFilter
  private _prismaValidationExceptionFilter: BaseExceptionFilter
  private _domainExceptionFilter: BaseExceptionFilter
  private _zodExceptionFilter: BaseExceptionFilter

  constructor(private readonly app: INestApplication<any>) {
    let loggingService = app.get(ILoggingService)

    if (!loggingService.report) {
      loggingService = instanciateClassWithDependenciesInjection(
        this.app,
        loggingService,
      )
    }

    this._globalExceptionFilter = new GlobalExceptionsFilter(loggingService)
    this._prismaValidationExceptionFilter = new PrismaValidationExceptionFilter(
      loggingService,
    )
    this._domainExceptionFilter = new DomainErrorsFilter(loggingService)
    this._zodExceptionFilter = new ZodErrorsFilter(loggingService)
  }

  addGlobalGuard(Guard: Type<CanActivate>) {
    this._guards.push(
      instanciateClassWithDependenciesInjection(this.app, Guard),
    )
    return this
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

    for (const guard of this._guards) {
      this.app.useGlobalGuards(guard)
    }

    return this.app
  }
}
