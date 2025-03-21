import { PaginationParams } from '@koalarx/nest/core/models/pagination-params'
import { ApiProperty } from '@nestjs/swagger'

export class ReadManyPersonRequest extends PaginationParams {
  @ApiProperty({ required: false })
  name?: string
}
