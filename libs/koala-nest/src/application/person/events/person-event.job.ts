import { Person } from '@/domain/entities/person/person';
import { EventHandlerBase } from '@/core/background-services/event-service/event-handler.base';
import { EventJob } from '@/core/background-services/event-service/event-job';
import { Type } from '@nestjs/common';
import { InactivePersonHandler } from './inactive-person.handler';

export class PersonEventJob extends EventJob<Person> {
  defineHandlers(): Type<EventHandlerBase>[] {
    return [InactivePersonHandler];
  }
}
