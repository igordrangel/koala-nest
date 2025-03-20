import { PaginationParams } from '@koalarx/nest/common/models/pagination-params'
import { ApiProperty } from '@nestjs/swagger'

export class ReadManyPersonRequest extends PaginationParams {
  @ApiProperty({ required: false })
  name?: string
}
