import { Person } from '@/domain/entities/person/person'
import { EventHandler } from '@koalarx/nest/core/backgroud-services/event-service/event-handler'
import { EventJob } from '@koalarx/nest/core/backgroud-services/event-service/event-job'
import { Type } from '@nestjs/common'
import { InactivePersonHandler } from './inactive-person/inactive-person-handler'

export class PersonEventJob extends EventJob<Person> {
  defineHandlers(): Type<EventHandler<any>>[] {
    return [InactivePersonHandler]
  }
}
