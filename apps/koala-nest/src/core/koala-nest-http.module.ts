import {
  DynamicModule,
  ForwardReference,
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
  imports?: Array<Type<any> | DynamicModule | ForwardReference<any>>
  automapperProfile: Type<AutoMappingProfile>
  middlewares?: Type<NestMiddleware>[]
}

@Module({})
export class KoalaNestHttpModule implements NestModule {
  private static _config: KoalaNestHttpModuleConfig

  static register(config: KoalaNestHttpModuleConfig): DynamicModule {
    this._config = config
    const imports = config.imports ?? []

    return {
      module: KoalaNestHttpModule,
      imports: [
        ...imports,
        AutoMappingModule.register(config.automapperProfile),
      ],
      providers: [EnvService],
      exports: [AutoMappingModule, ...imports],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    KoalaNestHttpModule._config.middlewares?.forEach((middleware) =>
      consumer.apply(middleware).forRoutes('*'),
    )
  }
}
