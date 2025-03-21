import { INestApplication, Type } from '@nestjs/common'
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import expressBasicAuth from 'express-basic-auth'
import { CronJob } from '../core/backgroud-services/cron-service/cron-job'
import { EventHandler } from '../core/backgroud-services/event-service/event-handler'
import { DomainErrorsFilter } from '../filters/domain-errors.filter'
import { GlobalExceptionsFilter } from '../filters/global-exception.filter'
import { PrismaValidationExceptionFilter } from '../filters/prisma-validation-exception.filter'
import { ZodErrorsFilter } from '../filters/zod-errors.filter'
import { EnvConfig } from './utils/env.config'

interface ApiDocConfig {
  endpoint: string
  title: string
  description?: string
  externalDoc?: {
    message: string
    url: string
  }
  version: string
  accessDocWithCredentials?: {
    username: string
    password: string
  }
  withAuthorization?: boolean
}

type CronJobClass = string | symbol | Function | Type<CronJob>

export class KoalaApp {
  private _globalExceptionFilter: BaseExceptionFilter
  private _prismaValidationExceptionFilter: BaseExceptionFilter
  private _domainExceptionFilter: BaseExceptionFilter
  private _zodExceptionFilter: BaseExceptionFilter

  private _cronJobs: CronJobClass[] = []
  private _eventJobs: EventHandler<any>[] = []

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

  addEventJob(eventJob: EventHandler<any>) {
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
    if (EnvConfig.isEnvDevelop && config.accessDocWithCredentials) {
      this.app.use(
        [config.endpoint],
        expressBasicAuth({
          challenge: true,
          users: {
            [config.accessDocWithCredentials.username]:
              config.accessDocWithCredentials.password,
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

    // this.app.use(swaggerEndpoint, apiReference({ content: document }))

    SwaggerModule.setup(swaggerEndpoint, this.app, document)

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

  async build() {
    this.app.useGlobalFilters(
      this._globalExceptionFilter,
      this._prismaValidationExceptionFilter,
      this._domainExceptionFilter,
      this._zodExceptionFilter,
    )

    Promise.all(this._cronJobs.map((job) => this.app.resolve(job))).then(
      (cronJobs) => cronJobs.forEach((job) => job.run()),
    )

    this._eventJobs.forEach((eventJob) => eventJob.setupSubscriptions())

    return this.app
  }
}
