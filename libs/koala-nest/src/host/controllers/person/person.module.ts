import { CreatePersonHandler } from '@/application/person/create/create-person.handler';
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler';
import { InactivePersonHandler } from '@/application/person/events/inactive-person.handler';
import { CreatePersonJob } from '@/application/person/jobs/create-person.job';
import { DeleteInactiveJob } from '@/application/person/jobs/delete-inactive.job';
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler';
import { ReadPersonHandler } from '@/application/person/read/read-person.handler';
import { UpdatePersonHandler } from '@/application/person/update/update-person.handler';
import { Module } from '@nestjs/common';
import { ControllerModule } from '../common/controller.module';
import { CreatePersonController } from './create-person.controller';
import { DeletePersonController } from './delete-person.controller';
import { ReadManyPersonController } from './read-many-person.controller';
import { ReadPersonController } from './read-person.controller';
import { UpdatePersonController } from './update-person.controller';

@Module({
  imports: [ControllerModule],
  controllers: [
    CreatePersonController,
    ReadPersonController,
    ReadManyPersonController,
    UpdatePersonController,
    DeletePersonController,
  ],
  providers: [
    CreatePersonHandler,
    ReadPersonHandler,
    ReadManyPersonHandler,
    UpdatePersonHandler,
    DeletePersonHandler,
    CreatePersonJob,
    DeleteInactiveJob,
    InactivePersonHandler,
  ],
  exports: [
    CreatePersonHandler,
    ReadManyPersonHandler,
    DeletePersonHandler,
    CreatePersonJob,
    DeleteInactiveJob,
    InactivePersonHandler,
  ],
})
export class PersonModule {}
