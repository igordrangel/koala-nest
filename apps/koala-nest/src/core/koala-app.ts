import {
  INestApplication,
  InternalServerErrorException,
  Type,
} from '@nestjs/common'
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import * as expressBasicAuth from 'express-basic-auth'
import { CronJob } from '../core/backgroud-services/cron-service/cron-job'
import { EventHandler } from '../core/backgroud-services/event-service/event-handler'
import { DomainErrorsFilter } from '../filters/domain-errors.filter'
import { GlobalExceptionsFilter } from '../filters/global-exception.filter'
import { PrismaValidationExceptionFilter } from '../filters/prisma-validation-exception.filter'
import { ZodErrorsFilter } from '../filters/zod-errors.filter'
import { PrismaTransactionalClient } from './database/prisma-transactional-client'
import { KoalaGlobalVars } from './koala-global-vars'
import { EnvConfig } from './utils/env.config'

interface ApiDocConfig {
  endpoint: string
  title: string
  ui?: 'swagger' | 'scalar'
  description?: string
  externalDoc?: {
    message: string
    url: string
  }
  version: string
  withAuthorization?: boolean
}

type CronJobClass = string | symbol | Function | Type<CronJob>
type EventJobClass = string | symbol | Function | Type<EventHandler<any>>

export class KoalaApp {
  private _globalExceptionFilter: BaseExceptionFilter
  private _prismaValidationExceptionFilter: BaseExceptionFilter
  private _domainExceptionFilter: BaseExceptionFilter
  private _zodExceptionFilter: BaseExceptionFilter

  private _cronJobs: CronJobClass[] = []
  private _eventJobs: EventJobClass[] = []

  constructor(private readonly app: INestApplication<any>) {
    const { httpAdapter } = app.get(HttpAdapterHost)

    this._globalExceptionFilter = new GlobalExceptionsFilter(httpAdapter)
    this._prismaValidationExceptionFilter =
      new PrismaValidationExceptionFilter()
    this._domainExceptionFilter = new DomainErrorsFilter()
    this._zodExceptionFilter = new ZodErrorsFilter()
  }

  addCronJob(job: CronJobClass) {
    this._cronJobs.push(job)
    return this
  }

  addEventJob(eventJob: EventJobClass) {
    this._eventJobs.push(eventJob)
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

  useDoc(config: ApiDocConfig) {
    const credentials = {
      username: process.env.SWAGGER_USERNAME ?? '',
      password: process.env.SWAGGER_PASSWORD ?? '',
    }

    if (
      EnvConfig.isEnvDevelop &&
      credentials.username &&
      credentials.password
    ) {
      this.app.use(
        [config.endpoint],
        expressBasicAuth({
          challenge: true,
          users: {
            [credentials.username]: credentials.password,
          },
        }),
      )
    }

    const documentBuilder = new DocumentBuilder()
      .setTitle(config.title)
      .setVersion(config.version)

    if (config.description) {
      documentBuilder.setDescription(config.description)
    }

    if (config.externalDoc) {
      documentBuilder.setExternalDoc(
        config.externalDoc.message,
        config.externalDoc.url,
      )
    }

    if (config.withAuthorization) {
      documentBuilder.addBearerAuth()
    }

    const document = SwaggerModule.createDocument(
      this.app,
      documentBuilder.build(),
    )
    const swaggerEndpoint = config.endpoint

    if (config.ui === 'scalar' && swaggerEndpoint === '/') {
      throw new InternalServerErrorException(
        "O endpoint de documentação não pode ser '/' para UI Scalar.",
      )
    }

    SwaggerModule.setup(swaggerEndpoint, this.app, document, {
      swaggerUiEnabled: config.ui !== 'scalar',
    })

    if (config.ui === 'scalar') {
      this.app.use(
        swaggerEndpoint,
        apiReference({ spec: { content: document } }),
      )
    }

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

  async build() {
    this.app.useGlobalFilters(
      this._globalExceptionFilter,
      this._prismaValidationExceptionFilter,
      this._domainExceptionFilter,
      this._zodExceptionFilter,
    )

    const cronJobs = await Promise.all(
      this._cronJobs.map((job) => this.app.resolve(job)),
    )

    for (const cronJob of cronJobs) {
      cronJob.start()
    }

    const eventJobs = await Promise.all(
      this._eventJobs.map((job) => this.app.resolve(job)),
    )

    for (const eventJob of eventJobs) {
      eventJob.setupSubscriptions()
    }

    return this.app
  }
}
