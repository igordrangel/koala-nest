import { Person } from '@/domain/entities/person/person';
import { EventHandlerBase } from '@/core/background-services/event-service/event-handler.base';
import { EventJob } from '@/core/background-services/event-service/event-job';
import { Type } from '@nestjs/common';
import { InactivePersonHandler } from './inactive-person/inactive-person.handler';

/**
 * Agregado de eventos do domínio Person.
 *
 * `defineHandlers()` é usado pelo `EventQueue` no dispatch para rotear cada
 * evento ao handler correto. Os handlers também precisam estar em
 * `JobsModule.register({ eventHandlers })` para o Nest instanciá-los e chamar
 * `setupSubscriptions()`.
 */
export class PersonEventJob extends EventJob<Person> {
  defineHandlers(): Type<EventHandlerBase>[] {
    return [InactivePersonHandler];
  }
}
