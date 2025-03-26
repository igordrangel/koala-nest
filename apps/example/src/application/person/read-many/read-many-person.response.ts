import { ListResponse } from '@koalarx/nest/core'
import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'
import { ReadPersonResponse } from '../read/read-person.response'

export class ReadManyPersonResponse
  implements ListResponse<ReadPersonResponse>
{
  @ApiProperty({ type: [ReadPersonResponse] })
  @AutoMap()
  items: ReadPersonResponse[]

  @ApiProperty()
  @AutoMap()
  count: number
}
