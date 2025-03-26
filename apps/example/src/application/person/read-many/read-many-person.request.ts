import {
  PaginatedRequestProps,
  PaginationRequest,
} from '@koalarx/nest/core/controllers/pagination.request'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class ReadManyPersonRequest extends PaginationRequest {
  @ApiProperty({ required: false })
  @AutoMap()
  name?: string

  @ApiProperty({ required: false })
  @AutoMap()
  active?: boolean

  constructor(props?: PaginatedRequestProps<ReadManyPersonRequest>) {
    super()
    Object.assign(this, props)
  }
}
