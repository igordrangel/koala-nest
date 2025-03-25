import { DynamicModule, Module, Provider } from '@nestjs/common'
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

interface KoalaNestModuleConfig {
  logging?: Provider<ILoggingService>
  env?: ZodType
}

@Module({})
export class KoalaNestModule {
  static register(config?: KoalaNestModuleConfig): DynamicModule {
    return {
      module: KoalaNestModule,
      imports: [
        ConfigModule.forRoot({
          validate: (envData) => (config?.env ?? envSchema).parse(envData),
          isGlobal: true,
        }),
        EnvModule,
      ],
      providers: [
        {
          provide: ILoggingService,
          useValue: config?.logging ?? LoggingService,
        },
        { provide: IRedisService, useClass: RedisService },
        { provide: IRedLockService, useClass: RedLockService },
        EnvService,
      ],
      exports: [ILoggingService, IRedisService, IRedLockService],
    }
  }
}
