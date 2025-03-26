import { EntityBase } from '@koalarx/nest/core/database/entity.base'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'

export class PersonAddress extends EntityBase<PersonAddress> {
  @AutoMap()
  id: number

  @AutoMap()
  address: string
}
