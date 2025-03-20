import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from 'automapper-classes'

export class ReadPersonPhoneResponse {
  @ApiProperty()
  @AutoMap()
  id: number

  @ApiProperty()
  @AutoMap()
  phone: string
}

export class ReadPersonResponse {
  @ApiProperty()
  @AutoMap()
  id: number

  @ApiProperty()
  @AutoMap()
  name: string

  @ApiProperty({ type: [ReadPersonPhoneResponse] })
  @AutoMap()
  phones: Array<ReadPersonPhoneResponse>
}
