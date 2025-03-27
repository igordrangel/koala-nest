import { CreatePersonHandler } from '@/application/person/create/create-person.handler'
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler'
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler'
import { ReadPersonHandler } from '@/application/person/read/read-person.handler'
import { UpdatePersonHandler } from '@/application/person/update/update-person.handler'
import { Module } from '@nestjs/common'
import { ControllerModule } from '../controller.module'
import { CreatePersonController } from './create-person.controller'
import { DeletePersonController } from './delete-person.controller'
import { ReadManyPersonController } from './read-many-person.controller'
import { ReadPersonController } from './read-person.controller'
import { UpdatePersonController } from './update-person.controller'

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
  ],
  exports: [
    ControllerModule,
    CreatePersonHandler,
    ReadManyPersonHandler,
    DeletePersonHandler,
  ],
})
export class PersonModule {}
