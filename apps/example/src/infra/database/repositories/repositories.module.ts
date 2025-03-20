import { IPersonRepository } from '@/domain/person/repositories/iperson.repository'
import { KoalaNestDatabaseModule } from '@koalarx/nest/core/koala-nest-database.module'
import { Module } from '@nestjs/common'
import { PersonRepository } from './person.repository'

@Module({
  imports: [
    KoalaNestDatabaseModule.register({
      repositories: [{ interface: IPersonRepository, class: PersonRepository }],
    }),
  ],
  exports: [KoalaNestDatabaseModule],
})
export class RepositoriesModule {}
