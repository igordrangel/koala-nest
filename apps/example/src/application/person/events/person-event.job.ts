import { Person } from '@/domain/entities/person/person'
import { EventHandlerBase } from '@koalarx/nest/core/backgroud-services/event-service/event-handler.base'
import { EventJob } from '@koalarx/nest/core/backgroud-services/event-service/event-job'
import { Type } from '@nestjs/common'
import { InactivePersonHandler } from './inactive-person/inactive-person-handler'

export class PersonEventJob extends EventJob<Person> {
  defineHandlers(): Type<EventHandlerBase<any>>[] {
    return [InactivePersonHandler]
  }
}
