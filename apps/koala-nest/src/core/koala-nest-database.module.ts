import { DynamicModule, InjectionToken, Module, Type } from '@nestjs/common'
import { RepositoryBase } from '../core/database/repository.base'
import { EnvService } from '../env/env.service'
import { PrismaService } from './database/prisma.service'

export const PRISMA_TOKEN = 'PRISMA_SERVICE_TOKEN'

export interface KoalaNestDatabaseProviderConfig<T> {
  interface: InjectionToken
  class: Type<T>
}

interface KoalaNestDatabaseModuleConfig {
  repositories: KoalaNestDatabaseProviderConfig<RepositoryBase<any>>[]
  services: KoalaNestDatabaseProviderConfig<any>[]
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

    const servicesToExport =
      config.services?.map((service) => service.interface) ?? []
    const servicesToProvide =
      config.services?.map((service) => ({
        provide: service.interface,
        useClass: service.class,
      })) ?? []

    return {
      module: KoalaNestDatabaseModule,
      providers: [
        {
          provide: PRISMA_TOKEN,
          useClass: PrismaService,
        },
        ...repositoriesToProvide,
        ...servicesToProvide,
        EnvService,
      ],
      exports: [PRISMA_TOKEN, ...repositoriesToExport, ...servicesToExport],
    }
  }
}
