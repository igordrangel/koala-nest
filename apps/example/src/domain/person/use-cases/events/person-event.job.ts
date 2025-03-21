import { EventJob } from '@koalarx/nest/core/backgroud-services/event-service/event-job'
import { Person } from '../../entities/person'
import { EventHandler } from '@koalarx/nest/core/backgroud-services/event-service/event-handler'
import { Type } from '@nestjs/common'
import { InactivePersonHandler } from './inactive-person/inactive-person-handler'

export class PersonEventJob extends EventJob<Person> {
  defineHandlers(): Type<EventHandler<any>>[] {
    return [InactivePersonHandler]
  }
}
