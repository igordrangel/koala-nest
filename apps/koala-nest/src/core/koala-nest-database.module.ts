import { DynamicModule, InjectionToken, Module, Type } from '@nestjs/common'
import { RepositoryBase } from '../core/database/repository.base'
import { EnvService } from '../env/env.service'
import { PrismaService } from '../services/prisma/prisma.service'

export const PRISMA_TOKEN = 'PRISMA_SERVICE_TOKEN'

export interface KoalaNestDatabaseRepositoryConfig {
  interface: InjectionToken
  class: Type<RepositoryBase<any>>
}

interface KoalaNestDatabaseModuleConfig {
  repositories: KoalaNestDatabaseRepositoryConfig[]
}

@Module({})
export class KoalaNestDatabaseModule {
  static register(config: KoalaNestDatabaseModuleConfig): DynamicModule {
    const repositoriesToExport =
      config.repositories?.map((repository) => repository.interface) ?? []
    const repositoriesToProvide =
      config.repositories?.map((repository) => ({
        provide: repository.interface,
        useClass: repository.class,
      })) ?? []

    return {
      module: KoalaNestDatabaseModule,
      providers: [
        {
          provide: PRISMA_TOKEN,
          useClass: PrismaService,
        },
        ...repositoriesToProvide,
        EnvService,
      ],
      exports: [PRISMA_TOKEN, ...repositoriesToExport],
    }
  }
}
