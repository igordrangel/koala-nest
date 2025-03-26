import { CreatePersonHandler } from '@/application/person/create/create-person.handler'
import { MappingProfile } from '@/application/mapping/mapping.profile'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { KoalaAppTestDependencies } from '@koalarx/nest/test/koala-app-test-dependencies'
import { PersonRepository } from './repositories/person.repository'
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler'
import { ReadPersonHandler } from '@/application/person/read/read-person.handler'
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler'
import { UpdatePersonHandler } from '@/application/person/update/update-person.handler'

export function createUnitTestApp() {
  const automapService = new AutoMappingService(new MappingProfile())
  const personRepository = new PersonRepository()

  return new KoalaAppTestDependencies({
    dependencies: [      
      new CreatePersonHandler(automapService, personRepository),
      new ReadPersonHandler(automapService, personRepository),
      new ReadManyPersonHandler(automapService, personRepository),
      new UpdatePersonHandler(automapService, personRepository),
      new DeletePersonHandler(personRepository)
    ]
  })
}