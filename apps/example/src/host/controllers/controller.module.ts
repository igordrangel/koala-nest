import { MappingProfile } from '@/application/mapping/mapping.profile'
import { InfraModule } from '@/infra/infra.module'
import { KoalaNestHttpModule } from '@koalarx/nest/core/koala-nest-http.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    KoalaNestHttpModule.register({
      automapperProfile: MappingProfile,
      middlewares: [],
    }),
    InfraModule,
  ],
  exports: [KoalaNestHttpModule, InfraModule],
})
export class ControllerModule {}
