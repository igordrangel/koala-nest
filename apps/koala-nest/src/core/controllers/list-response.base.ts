import { ApiProperty } from '@nestjs/swagger'

export abstract class ListResponseBase<TResponse> {
  abstract items: Array<TResponse>

  @ApiProperty()
  count: number
}
