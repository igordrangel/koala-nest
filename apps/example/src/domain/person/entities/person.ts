import { EntityBase } from '@koalarx/nest/core/database/entity.base'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { List } from '@koalarx/nest/core/utils/list'
import { PersonPhone } from './person-phone'
import { PersonEventJob } from '../use-cases/events/person-event.job'

export class Person extends EntityBase<Person> {
  @AutoMap()
  id: number

  @AutoMap()
  name: string

  @AutoMap({ type: List })
  phones = new List(PersonPhone)

  @AutoMap()
  active: boolean

  private _eventJobs = new PersonEventJob(this)

  get eventJobs() {
    return this._eventJobs
  }
}
