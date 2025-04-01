import { EntityBase } from '@koalarx/nest/core/database/entity.base'
import { Entity } from '@koalarx/nest/core/database/entity.decorator'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { List } from '@koalarx/nest/core/utils/list'
import { PersonAddress } from './person-address'
import { PersonPhone } from './person-phone'

@Entity()
export class Person extends EntityBase<Person> {
  @AutoMap()
  id: number

  @AutoMap()
  name: string

  @AutoMap({ type: List })
  phones = new List(PersonPhone)

  @AutoMap({ type: PersonAddress })
  address: PersonAddress

  @AutoMap()
  active: boolean
}
