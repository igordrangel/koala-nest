import { MappingProfile } from '@/application/mapping/mapping.profile'
import { RepositoriesModule } from '@/infra/database/repositories/repositories.module'
import { KoalaNestHttpModule } from '@koalarx/nest/core/koala-nest-http.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    KoalaNestHttpModule.register({
      automapperProfile: MappingProfile,
      middlewares: [],
    }),
    RepositoriesModule,
  ],
  exports: [KoalaNestHttpModule, RepositoriesModule],
})
export class ControllerModule {}
