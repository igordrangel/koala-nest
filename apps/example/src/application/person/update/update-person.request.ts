import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdatePersonAddressRequest {
  @ApiProperty()
  @AutoMap()
  id: number

  @ApiProperty({ example: 'Street 2' })
  @AutoMap()
  address: string
}

export class UpdatePersonPhoneRequest {
  @ApiProperty({ required: false })
  @AutoMap()
  id?: number

  @ApiProperty({ example: 22888888888 })
  @AutoMap()
  phone: string
}

export class UpdatePersonRequest {
  @ApiProperty({ example: 'Mark Willians' })
  @AutoMap()
  name: string

  @ApiProperty({ example: false })
  @AutoMap()
  active: boolean

  @ApiProperty({ type: [UpdatePersonPhoneRequest] })
  @AutoMap({ type: UpdatePersonPhoneRequest, isArray: true })
  phones: Array<UpdatePersonPhoneRequest>

  @ApiProperty({ type: UpdatePersonAddressRequest })
  @AutoMap({ type: UpdatePersonAddressRequest })
  address: UpdatePersonAddressRequest
}
