import { ListResponse } from '@koalarx/nest/core/@types'
import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from 'automapper-classes'
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
