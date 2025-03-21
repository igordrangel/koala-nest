import { EventClass } from '@koalarx/nest/core/backgroud-services/event-service/event-class'
import { Person } from '../../../entities/person'

export class InactivePersonEvent extends EventClass<Person> {}
