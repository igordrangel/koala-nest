import { MappingProfile } from '@/application/mapping/mapping.profile'
import { InfraModule } from '@/infra/infra.module'
import { KoalaNestHttpModule } from '@koalarx/nest/core/koala-nest-http.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    KoalaNestHttpModule.register({
      imports: [InfraModule],
      automapperProfile: MappingProfile,
      middlewares: [],
    }),
  ],
  exports: [KoalaNestHttpModule],
})
export class ControllerModule {}
