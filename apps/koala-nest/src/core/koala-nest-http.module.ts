import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
  Type,
} from '@nestjs/common'
import { EnvService } from '../env/env.service'
import { AutoMappingProfile } from './mapping/auto-mapping-profile'
import { AutoMappingModule } from './mapping/auto-mapping.module'

interface KoalaNestHttpModuleConfig {
  automapperProfile: Type<AutoMappingProfile>
  middlewares?: Type<NestMiddleware>[]
}

@Module({})
export class KoalaNestHttpModule implements NestModule {
  private static _config: KoalaNestHttpModuleConfig

  static register(config: KoalaNestHttpModuleConfig): DynamicModule {
    this._config = config

    return {
      module: KoalaNestHttpModule,
      imports: [AutoMappingModule.register(config.automapperProfile)],
      providers: [EnvService],
      exports: [AutoMappingModule],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    KoalaNestHttpModule._config.middlewares?.forEach((middleware) =>
      consumer.apply(middleware).forRoutes('*'),
    )
  }
}
