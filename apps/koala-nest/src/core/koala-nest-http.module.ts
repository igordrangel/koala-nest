import {
  DynamicModule,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
  Provider,
  Type,
} from '@nestjs/common'
import { classes } from 'automapper-classes'
import { AutomapperModule, AutomapperProfile } from 'automapper-nestjs'
import { EnvService } from '../services/env/env.service'

interface KoalaNestHttpModuleConfig {
  automapperProfile: Provider<AutomapperProfile>
  middlewares?: Type<NestMiddleware>[]
}

@Module({})
export class KoalaNestHttpModule implements NestModule {
  private static _config: KoalaNestHttpModuleConfig

  static register(config: KoalaNestHttpModuleConfig): DynamicModule {
    this._config = config

    return {
      module: KoalaNestHttpModule,
      imports: [
        AutomapperModule.forRoot({
          strategyInitializer: classes(),
        }),
      ],
      providers: [config.automapperProfile, EnvService],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    KoalaNestHttpModule._config.middlewares?.forEach((middleware) =>
      consumer.apply(middleware).forRoutes('*'),
    )
  }
}
