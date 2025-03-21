import { Entity, EntityProps } from '@koalarx/nest/core/database/entity'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { List } from '@koalarx/nest/core/utils/list'
import { PersonPhone } from './person-phone'

export class Person extends Entity<Person> {
  @AutoMap()
  id: number

  @AutoMap()
  name: string

  @AutoMap()
  phones = new List(PersonPhone)

  constructor(props: EntityProps<Person>) {
    super()
    this.automap(props)
  }
}
