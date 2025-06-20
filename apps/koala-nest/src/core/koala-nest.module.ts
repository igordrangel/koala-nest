import { DynamicModule, Module, Provider, Type } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ZodType } from 'zod'
import { envSchema } from '../env/env'
import { EnvModule } from '../env/env.module'
import { EnvService } from '../env/env.service'
import { ILoggingService } from '../services/logging/ilogging.service'
import { LoggingService } from '../services/logging/logging.service'
import { IRedisService } from '../services/redis/iredis.service'
import { RedisService } from '../services/redis/redis.service'
import { IRedLockService } from '../services/redlock/ired-lock.service'
import { RedLockService } from '../services/redlock/red-lock.service'
import { CronJobHandlerBase } from './backgroud-services/cron-service/cron-job.handler.base'
import { EventHandlerBase } from './backgroud-services/event-service/event-handler.base'
import { HealthCheckModule } from './health-check/health-check.module'

interface KoalaNestModuleConfig {
  logging?: Provider<ILoggingService>
  env?: ZodType
  controllers?: Type<any>[]
  healthCheck?: Type<any>
  cronJobs?: Type<CronJobHandlerBase>[]
  eventJobs?: Type<EventHandlerBase>[]
}

@Module({})
export class KoalaNestModule {
  static register(config?: KoalaNestModuleConfig): DynamicModule {
    const controllers = config?.controllers ?? []
    const healthCheck = config?.healthCheck ?? HealthCheckModule
    const cronJobsProviders = config?.cronJobs ?? []
    const eventJobsProviders = config?.eventJobs ?? []
    const loggingServiceClass = config?.logging ?? LoggingService

    return {
      module: KoalaNestModule,
      imports: [
        ConfigModule.forRoot({
          validate: (envData) => (config?.env ?? envSchema).parse(envData),
          isGlobal: true,
        }),
        EnvModule,
        healthCheck,
        ...controllers,
      ],
      providers: [
        ...cronJobsProviders,
        ...eventJobsProviders,
        {
          provide: ILoggingService,
          useValue: loggingServiceClass,
        },
        { provide: IRedisService, useClass: RedisService },
        { provide: IRedLockService, useClass: RedLockService },
        EnvService,
      ],
      exports: [
        ...cronJobsProviders,
        ...eventJobsProviders,
        ILoggingService,
        IRedisService,
        IRedLockService,
        EnvService,
      ],
    }
  }
}
