import { CreatePersonHandler } from '@/domain/person/use-cases/create/create-person.handler'
import { DeletePersonHandler } from '@/domain/person/use-cases/delete/delete-person.handler'
import { ReadManyPersonHandler } from '@/domain/person/use-cases/read-many/read-many-person.handler'
import { ReadPersonHandler } from '@/domain/person/use-cases/read/read-person.handler'
import { UpdatePersonHandler } from '@/domain/person/use-cases/update/update-person.handler'
import { RepositoriesModule } from '@/infra/database/repositories/repositories.module'
import { Module } from '@nestjs/common'
import { CreatePersonController } from './create-person.controller'
import { DeletePersonController } from './delete-person.controller'
import { ReadManyPersonController } from './read-many-person.controller'
import { ReadPersonController } from './read-person.controller'
import { UpdatePersonController } from './update-person.controller'

@Module({
  imports: [RepositoriesModule],
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
})
export class PersonModule {}
