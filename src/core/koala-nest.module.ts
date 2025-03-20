import { DynamicModule, Module, Provider } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ZodType } from 'zod'
import { envSchema } from '../services/env/env'
import { EnvService } from '../services/env/env.service'
import { ILoggingService } from '../services/logging/ilogging.service'
import { LoggingService } from '../services/logging/logging.service'
import { IRedisService } from '../services/redis/iredis.service'
import { RedisService } from '../services/redis/redis.service'
import { IRedLockService } from '../services/redlock/ired-lock.service'
import { RedLockService } from '../services/redlock/red-lock.service'
import {
  KoalaNestDatabaseModule,
  KoalaNestDatabaseRepositoryConfig,
} from './koala-nest-database.module'
import { EnvModule } from 'src/services/env/env.module'

interface KoalaNestModuleConfig {
  logging?: Provider<ILoggingService>
  env?: ZodType
  repositories?: KoalaNestDatabaseRepositoryConfig[]
}

@Module({
  imports: [EnvModule],
  providers: [
    { provide: IRedisService, useClass: RedisService },
    { provide: IRedLockService, useClass: RedLockService },
    EnvService,
  ],
})
export class KoalaNestModule {
  static forRoot({
    env,
    logging,
    repositories,
  }: KoalaNestModuleConfig): DynamicModule {
    return {
      module: KoalaNestModule,
      imports: [
        ConfigModule.forRoot({
          validate: (envData) => (env ?? envSchema).parse(envData),
          isGlobal: true,
        }),
        KoalaNestDatabaseModule.forRoot({
          repositories,
        }),
      ],
      providers: [
        {
          provide: ILoggingService,
          useValue: logging ?? LoggingService,
        },
      ],
    }
  }
}
