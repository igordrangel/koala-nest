import { CreatePersonJob } from '@/domain/person/use-cases/create-person-job/create-person-job'
import { CreatePersonHandler } from '@/domain/person/use-cases/create/create-person.handler'
import { DeleteInactiveJob } from '@/domain/person/use-cases/delete-inative-job/delete-inactive-job'
import { DeletePersonHandler } from '@/domain/person/use-cases/delete/delete-person.handler'
import { InactivePersonHandler } from '@/domain/person/use-cases/events/inactive-person/inactive-person-handler'
import { ReadManyPersonHandler } from '@/domain/person/use-cases/read-many/read-many-person.handler'
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'
import { Module } from '@nestjs/common'
import { ControllersModule } from './controllers/controllers.module'
import { RepositoriesModule } from './database/repositories/repositories.module'

@Module({
  imports: [
    KoalaNestModule.register(), 
    RepositoriesModule, 
    ControllersModule
  ],
  providers: [
    CreatePersonHandler,
    ReadManyPersonHandler,
    DeletePersonHandler,
    DeleteInactiveJob,
    CreatePersonJob,
    InactivePersonHandler,
  ],
})
export class AppModule {}
