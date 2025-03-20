import { Entity, EntityProps } from '@koalarx/nest/core/database/entity'
import { AutoMap } from 'automapper-classes'

export class PersonPhone extends Entity<PersonPhone> {
  @AutoMap()
  id: number

  @AutoMap()
  phone: string

  constructor(props: EntityProps<PersonPhone>) {
    super()
    this.automap(props)
  }
}
