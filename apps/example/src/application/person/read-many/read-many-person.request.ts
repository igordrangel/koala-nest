import { PaginatedRequestProps, PaginationParams } from '@koalarx/nest/core/models/pagination-params'
import { ApiProperty } from '@nestjs/swagger'

export class ReadManyPersonRequest extends PaginationParams {
  @ApiProperty({ required: false })
  name?: string

  @ApiProperty({ required: false })
  active?: boolean

  constructor(props?: PaginatedRequestProps<ReadManyPersonRequest>) {
    super()
    Object.assign(this, props)
  }
}
