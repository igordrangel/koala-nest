import { ApiProperty } from '@nestjs/swagger'

export class UpdatePersonPhoneRequest {
  @ApiProperty()
  // @AutoMap()
  id: number

  @ApiProperty()
  // @AutoMap()
  phone: string
}

export class UpdatePersonRequest {
  @ApiProperty()
  // @AutoMap()
  id: number

  @ApiProperty()
  // @AutoMap()
  name: string

  @ApiProperty({ type: [UpdatePersonPhoneRequest] })
  // @AutoMap()
  phones: Array<UpdatePersonPhoneRequest>
}
