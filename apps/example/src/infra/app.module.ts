import { CreatePersonJob } from '@/application/person/create-person-job/create-person-job'
import { CreatePersonHandler } from '@/application/person/create/create-person.handler'
import { DeleteInactiveJob } from '@/application/person/delete-inative-job/delete-inactive-job'
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler'
import { InactivePersonHandler } from '@/application/person/events/inactive-person/inactive-person-handler'
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler'
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
