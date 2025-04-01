import { EntityBase } from '@koalarx/nest/core/database/entity.base'
import { Entity } from '@koalarx/nest/core/database/entity.decorator'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'

@Entity()
export class PersonAddress extends EntityBase<PersonAddress> {
  @AutoMap()
  id: number

  @AutoMap()
  address: string
}
