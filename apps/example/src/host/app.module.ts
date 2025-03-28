import { CreatePersonJob } from '@/application/person/create-person-job/create-person-job'
import { DeleteInactiveJob } from '@/application/person/delete-inative-job/delete-inactive-job'
import { InactivePersonHandler } from '@/application/person/events/inactive-person/inactive-person-handler'
import { env } from '@/core/env'
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'
import { Module } from '@nestjs/common'
import { PersonModule } from './controllers/person/person.module'

@Module({
  imports: [
    KoalaNestModule.register({
      env,
      controllers: [PersonModule],
      cronJobs: [DeleteInactiveJob, CreatePersonJob],
      eventJobs: [InactivePersonHandler],
    }),
  ],
})
export class AppModule {}
