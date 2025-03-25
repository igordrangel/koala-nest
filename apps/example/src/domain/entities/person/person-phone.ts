import { EntityBase } from '@koalarx/nest/core/database/entity.base'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'

export class PersonPhone extends EntityBase<PersonPhone> {
  @AutoMap()
  id: number

  @AutoMap()
  phone: string
}
