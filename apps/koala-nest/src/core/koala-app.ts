import {
  INestApplication,
  InternalServerErrorException,
  Type,
} from '@nestjs/common'
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { apiReference } from '@scalar/nestjs-api-reference'
import * as expressBasicAuth from 'express-basic-auth'
import { DomainErrorsFilter } from '../filters/domain-errors.filter'
import { GlobalExceptionsFilter } from '../filters/global-exception.filter'
import { PrismaValidationExceptionFilter } from '../filters/prisma-validation-exception.filter'
import { ZodErrorsFilter } from '../filters/zod-errors.filter'
import { ILoggingService } from '../services/logging/ilogging.service'
import { CronJobHandlerBase } from './backgroud-services/cron-service/cron-job.handler.base'
import { EventHandlerBase } from './backgroud-services/event-service/event-handler.base'
import { PrismaTransactionalClient } from './database/prisma-transactional-client'
import { KoalaGlobalVars } from './koala-global-vars'
import { instanciateClassWithDependenciesInjection } from './utils/dependency-injection'
import { EnvConfig } from './utils/env.config'

interface ApiDocAuthorizationConfig {
  name: string
  config: SecuritySchemeObject
}

interface ApiDocServerConfig {
  url: string
  description: string
}

type ScalarTheme =
  | 'alternate'
  | 'default'
  | 'moon'
  | 'purple'
  | 'solarized'
  | 'bluePlanet'
  | 'saturn'
  | 'kepler'
  | 'mars'
  | 'deepSpace'
  | 'none'

interface ApiDocConfig {
  endpoint: string
  title: string
  ui?: 'swagger' | 'scalar'
  theme?: ScalarTheme
  description?: string
  externalDoc?: {
    message: string
    url: string
  }
  servers?: ApiDocServerConfig[]
  version: string
  authorizations?: boolean | ApiDocAuthorizationConfig[]
}

type CronJobClass = string | symbol | Function | Type<CronJobHandlerBase>
type EventJobClass = string | symbol | Function | Type<EventHandlerBase<any>>

export class KoalaApp {
  private _globalExceptionFilter: BaseExceptionFilter
  private _prismaValidationExceptionFilter: BaseExceptionFilter
  private _domainExceptionFilter: BaseExceptionFilter
  private _zodExceptionFilter: BaseExceptionFilter

  private _cronJobs: CronJobClass[] = []
  private _eventJobs: EventJobClass[] = []

  constructor(private readonly app: INestApplication<any>) {
    const { httpAdapter } = this.app.get(HttpAdapterHost)
    let loggingService = this.app.get(ILoggingService)

    if (!loggingService.report) {
      loggingService = instanciateClassWithDependenciesInjection(
        this.app,
        loggingService,
      )
    }
    this._globalExceptionFilter = new GlobalExceptionsFilter(
      httpAdapter,
      loggingService,
    )
    this._prismaValidationExceptionFilter = new PrismaValidationExceptionFilter(
      loggingService,
    )
    this._domainExceptionFilter = new DomainErrorsFilter(loggingService)
    this._zodExceptionFilter = new ZodErrorsFilter(loggingService)
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
      if (config.externalDoc) {
        documentBuilder.setDescription(
          `${config.description}\n\n[${config.externalDoc.message}](${config.externalDoc.url})`,
        )
      } else {
        documentBuilder.setDescription(config.description)
      }
    }

    if (config.authorizations) {
      if (Array.isArray(config.authorizations)) {
        for (const auth of config.authorizations) {
          documentBuilder.addBearerAuth(auth.config, auth.name)
          documentBuilder.addSecurityRequirements(auth.name)
        }
      } else {
        documentBuilder.addBearerAuth()
      }
    }

    if (config.servers) {
      for (const server of config.servers) {
        documentBuilder.addServer(server.url, server.description)
      }
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
        apiReference({
          spec: {
            content: document,
          },
          hideModels: true,
          hideDownloadButton: true,
          hideClientButton: true,
          theme: config.theme ?? 'default',
          hiddenClients: [
            'libcurl',
            'clj_http',
            'restsharp',
            'native',
            'http1.1',
            'asynchttp',
            'nethttp',
            'okhttp',
            'unirest',
            'xhr',
            'okhttp',
            'native',
            'request',
            'unirest',
            'nsurlsession',
            'cohttp',
            'guzzle',
            'http1',
            'http2',
            'webrequest',
            'restmethod',
            'requests',
            'httr',
            'native',
            'httpie',
            'wget',
            'nsurlsession',
            'undici',
          ],
          metaData: {
            title: config.title,
            description: config.description,
          },
        }),
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
