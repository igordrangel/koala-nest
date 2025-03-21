import { MappingProfile } from '@/domain/mapping/mapping.profile'
import { KoalaNestHttpModule } from '@koalarx/nest/core/koala-nest-http.module'
import { Module } from '@nestjs/common'
import { RepositoriesModule } from '../database/repositories/repositories.module'
import { PersonModule } from './person/person.module'

@Module({
  imports: [
    KoalaNestHttpModule.register({
      automapperProfile: MappingProfile,
      middlewares: [],
    }),
    RepositoriesModule,
    PersonModule,
  ],
  exports: [KoalaNestHttpModule],
})
export class ControllersModule {}
