import { MappingProfile } from '@/domain/mapping/mapping.profile'
import { CreatePersonHandler } from '@/domain/person/use-cases/create/create-person.handler'
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
  providers: [CreatePersonHandler],
})
export class ControllersModule {}
