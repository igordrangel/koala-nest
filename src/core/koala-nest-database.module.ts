import { DynamicModule, InjectionToken, Module, Type } from '@nestjs/common'
import { RepositoryBase } from '../core/database/repository.base'
import { EnvService } from '../services/env/env.service'
import { PrismaService } from '../services/prisma/prisma.service'

export interface KoalaNestDatabaseRepositoryConfig {
  interface: InjectionToken
  class: Type<RepositoryBase<any>>
}

interface KoalaNestDatabaseModuleConfig {
  repositories?: KoalaNestDatabaseRepositoryConfig[]
}

@Module({
  providers: [
    {
      provide: 'PRISMA_SERVICE_TOKEN',
      useClass: PrismaService,
    },
    EnvService,
  ],
  exports: ['PRISMA_SERVICE_TOKEN'],
})
export class KoalaNestDatabaseModule {
  static forRoot(config: KoalaNestDatabaseModuleConfig): DynamicModule {
    return {
      module: KoalaNestDatabaseModule,
      providers: config.repositories?.map((repository) => ({
        provide: repository.interface,
        useClass: repository.class,
      })),
      exports: config.repositories?.map((repository) => repository.interface),
    }
  }
}
