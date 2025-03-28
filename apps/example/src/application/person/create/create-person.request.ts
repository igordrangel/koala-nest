import { AutoMap } from '@koalarx/nest/core/mapping/auto-mapping.decorator'
import { ApiProperty } from '@nestjs/swagger'

export class CreatePersonAddressRequest {
  @ApiProperty({ example: 'Street 1' })
  @AutoMap()
  address: string
}

export class CreatePersonPhoneRequest {
  @ApiProperty({ example: '22999999999' })
  @AutoMap()
  phone: string
}

export class CreatePersonRequest {
  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string

  @ApiProperty({ type: [CreatePersonPhoneRequest] })
  @AutoMap({ type: CreatePersonPhoneRequest, isArray: { addTo: true } })
  phones: Array<CreatePersonPhoneRequest>

  @ApiProperty({ type: CreatePersonAddressRequest })
  @AutoMap({ type: CreatePersonAddressRequest })
  address: CreatePersonAddressRequest
}
