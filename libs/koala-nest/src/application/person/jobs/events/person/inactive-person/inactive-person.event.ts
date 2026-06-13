import { EventClass } from '@/core/background-services/event-service/event-class';
import { Person } from '@/domain/entities/person/person';

export class InactivePersonEvent extends EventClass<Person> {}
