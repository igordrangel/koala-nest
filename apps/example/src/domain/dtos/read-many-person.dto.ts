import { PaginatedRequestProps } from '@koalarx/nest/core/controllers/pagination.request'
import { PaginationDto } from '@koalarx/nest/core/dtos/pagination.dto'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'

export class ReadManyPersonDto extends PaginationDto {
  @AutoMap()
  name?: string

  @AutoMap()
  active?: boolean

  constructor(props?: PaginatedRequestProps<ReadManyPersonDto>) {
    super()
    Object.assign(this, props)
  }
}
