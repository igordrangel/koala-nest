import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from 'automapper-classes'

export class CreatePersonPhoneRequest {
  @ApiProperty()
  @AutoMap()
  phone: string
}

export class CreatePersonRequest {
  @ApiProperty()
  @AutoMap()
  name: string

  @ApiProperty({ type: [CreatePersonPhoneRequest] })
  @AutoMap()
  phones: Array<CreatePersonPhoneRequest>
}
